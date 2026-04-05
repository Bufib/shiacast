//! Last that workted
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  useColorScheme,
} from "react-native";
import Pdf from "react-native-pdf";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { usePdfs } from "../../hooks/usePdfs";
import { useLanguage } from "../../contexts/LanguageContext";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PdfViewerScreenPropsType } from "@/constants/Types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderLeftBackButton from "./HeaderLeftBackButton";
import { isPdfFavorited, togglePdfFavorite } from "../../utils/favorites";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { Zoomable } from "@likashefqet/react-native-image-zoom";
const getPdfNumericId = (filename: string): number => {
  const asNumber = Number(filename);
  if (Number.isFinite(asNumber)) return asNumber;

  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = (hash * 31 + filename.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
};

const isImageFile = (name: string): boolean =>
  /\.(jpe?g|png|webp|gif)$/i.test(name.toLowerCase());

const PdfViewerScreen: React.FC<PdfViewerScreenPropsType> = ({ filename }) => {
  const router = useRouter();

  const { rtl, lang } = useLanguage();
  const { getCachedUri, downloadPdf } = usePdfs(lang);

  const [sourceUri, setSourceUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() || "light";

  // eBook reader features
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showPageJump, setShowPageJump] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Download state
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Layout toggle - GLOBAL preference
  const [isHorizontal, setIsHorizontal] = useState<boolean>(true);

  // Favorites
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const pdfRef = useRef<any>(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);
  const currentFilenameRef = useRef<string | undefined>(undefined);
  const hasLoadedPreferencesRef = useRef(false);
  const { t } = useTranslation();
  const incrementPdfFavoritesVersion = useDataVersionStore(
    (s) => s.incrementPdfFavoritesVersion,
  );

  const isImage = filename ? isImageFile(filename) : false;
  const lastPageRef = useRef<number>(1);
  // Load GLOBAL layout preference once on mount
  useEffect(() => {
    const loadGlobalPreference = async () => {
      try {
        const savedHorizontal = await AsyncStorage.getItem("pdf_layout_global");
        if (savedHorizontal !== null) {
          setIsHorizontal(savedHorizontal === "true");
        }
        hasLoadedPreferencesRef.current = true;
      } catch (err) {
        console.warn("Failed to load layout preference:", err);
        hasLoadedPreferencesRef.current = true;
      }
    };

    loadGlobalPreference();
  }, []);

  // Load saved reading position (per-file) – PDFs only
  useEffect(() => {
    if (!filename || isImage) return;

    const loadSavedPage = async () => {
      try {
        const savedPage = await AsyncStorage.getItem(`pdf_page_${filename}`);
        if (savedPage) setCurrentPage(parseInt(savedPage, 10));
      } catch (err) {
        console.warn("Failed to load saved page:", err);
      }
    };

    loadSavedPage();
  }, [filename, isImage]);

  // Save GLOBAL layout preference - ONLY after initial load
  useEffect(() => {
    if (!hasLoadedPreferencesRef.current) return;

    AsyncStorage.setItem("pdf_layout_global", isHorizontal.toString()).catch(
      console.warn,
    );
  }, [isHorizontal]);

  // Save reading position (debounced) – PDFs only
  useEffect(() => {
    if (!filename || isImage || currentPage === 1) return;
    const saveTimeout = setTimeout(() => {
      AsyncStorage.setItem(
        `pdf_page_${filename}`,
        currentPage.toString(),
      ).catch(console.warn);
    }, 1000);
    return () => clearTimeout(saveTimeout);
  }, [currentPage, filename, isImage]);

  // Favorites: load initial favorite state
  useEffect(() => {
    if (!filename) {
      setIsFavorite(false);
      return;
    }
    const id = getPdfNumericId(filename);
    let mounted = true;
    (async () => {
      try {
        const result = await isPdfFavorited(id, lang);
        if (mounted) setIsFavorite(result);
      } catch (e) {
        console.warn("[PdfViewer] isPdfFavorited error", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filename, lang]);

  const onPressToggleFavorite = async () => {
    if (!filename) return;
    const id = getPdfNumericId(filename);
    try {
      const next = await togglePdfFavorite(id, lang);
      setIsFavorite(next);
      incrementPdfFavoritesVersion();
    } catch (e) {
      console.warn("[PdfViewer] togglePdfFavorite error", e);
    }
  };

  // Download/Share function (works for both PDF and images)
  const handleDownloadPdf = async () => {
    if (!sourceUri || isDownloading || !filename) return;

    let tempFilePath: string | null = null;

    try {
      setIsDownloading(true);

      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert("Unavailable", "Sharing is not available on this device");
        return;
      }

      const extension = filename.includes(".") ? "" : isImage ? "" : ".pdf";
      const fileName = `${filename}${extension}`;
      tempFilePath = `${
        FileSystem.documentDirectory
      }temp_${Date.now()}_${fileName}`;

      await FileSystem.copyAsync({
        from: sourceUri,
        to: tempFilePath,
      });

      const mimeType = isImage
        ? `image/${filename.split(".").pop()?.toLowerCase() === "png" ? "png" : "jpeg"}`
        : "application/pdf";

      await Sharing.shareAsync(tempFilePath, {
        mimeType,
        dialogTitle: `Save ${filename}`,
        UTI: isImage ? "public.image" : "com.adobe.pdf",
      });
    } catch (err: any) {
      console.warn("[Viewer] Download error:", err);
      Alert.alert("Download Failed", err?.message || "Unable to save the file");
    } finally {
      if (tempFilePath) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(tempFilePath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
          }
        } catch (cleanupErr) {
          console.warn("[Viewer] Cleanup error:", cleanupErr);
        }
      }
      setIsDownloading(false);
    }
  };

  // Auto-hide controls
  const resetControlsTimer = () => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    hideControlsTimer.current = setTimeout(() => {
      hideControls();
    }, 4000);
  };

  const hideControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowControls(false);
    });
  };

  const toggleControls = () => {
    if (showControls) {
      hideControls();
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    } else {
      resetControlsTimer();
    }
  };

  // Reset loaded state when filename changes
  useEffect(() => {
    if (currentFilenameRef.current !== filename) {
      hasLoadedRef.current = false;
      currentFilenameRef.current = filename;
      setSourceUri(null);
      setError(null);
      setLoading(true);
      setPageCount(0);
      setCurrentPage(1);
    }
  }, [filename]);

  // File loading
  useEffect(() => {
    if (!filename) {
      setError("No filename provided.");
      setLoading(false);
      return;
    }

    if (hasLoadedRef.current && sourceUri) return;

    let cancelled = false;

    const prepare = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        const cached = await getCachedUri(filename);

        if (cancelled) return;

        if (cached) {
          setSourceUri(cached);
          hasLoadedRef.current = true;
        } else {
          const localUri = await downloadPdf({
            filename,
            onProgress: (frac) => {
              if (!cancelled) setProgress(frac);
            },
          });

          if (!cancelled) {
            setSourceUri(localUri);
            hasLoadedRef.current = true;
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to load file.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    prepare();

    return () => {
      cancelled = true;
    };
  }, [filename, lang, downloadPdf, getCachedUri, sourceUri]);

  // Navigation functions – PDFs only
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pageCount && pdfRef.current) {
      pdfRef.current.setPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < pageCount) goToPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };

  const toggleLayout = () => {
    setIsHorizontal(!isHorizontal);
  };

  const effectiveIsHorizontal = pageCount === 1 ? true : isHorizontal;

  if (!filename) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t("error")}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isImage && styles.containerBlack]}>
      <StatusBar style={showControls ? "light" : "dark"} />

      {/* Error state */}
      {error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading state */}
      {!error && loading ? (
        <ThemedView style={styles.center}>
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme].defaultIcon}
          />
          {progress > 0 && (
            <ThemedText style={styles.progressText}>
              {t("loading")} {Math.round(progress * 100)}%
            </ThemedText>
          )}
        </ThemedView>
      ) : null}

      {/* Content loaded */}
      {!error && !loading && sourceUri ? (
        <>
          {isImage ? (
            <Zoomable
              minScale={1}
              maxScale={5}
              doubleTapScale={3}
              onSingleTap={toggleControls}
              style={styles.imageContainer}
            >
              <Image
                source={{ uri: sourceUri }}
                style={StyleSheet.absoluteFill}
                contentFit="contain"
                transition={200}
              />
            </Zoomable>
          ) : (
            /* ───── PDF Viewer ───── */
            <View style={styles.pdfContainer}>
              <Pdf
                ref={pdfRef}
                source={{ uri: sourceUri, cache: true }}
                style={styles.pdf}
                enablePaging={effectiveIsHorizontal}
                horizontal={effectiveIsHorizontal}
                enableRTL={rtl}
                trustAllCerts={false}
                minScale={1}
                maxScale={3.0}
                enableAntialiasing={true}
                enableAnnotationRendering={true}
                enableDoubleTapZoom
                fitPolicy={2}
                spacing={10}
                onLoadComplete={(numberOfPages) => {
                  setPageCount(numberOfPages);
                }}
                onPageChanged={(page) => {
                  const scrollingUp = page < lastPageRef.current;
                  lastPageRef.current = page;
                  setCurrentPage(page);

                  if (effectiveIsHorizontal) {
                    resetControlsTimer();
                  } else {
                    if (scrollingUp) {
                      resetControlsTimer();
                    } else {
                      hideControls();
                    }
                  }
                }}
                onError={(pdfError) => {
                  console.log("[PDF error]", pdfError);
                  setError(
                    pdfError instanceof Error
                      ? pdfError.message
                      : String(pdfError),
                  );
                }}
              />
            </View>
          )}

          {/* ───── Top Controls Bar ───── */}
          {showControls ? (
            <Animated.View
              style={[
                styles.topBar,
                { opacity: controlsOpacity, paddingTop: insets.top },
              ]}
            >
              <HeaderLeftBackButton color={"#fff"} />

              {/* Page info – PDFs only */}
              {!isImage && (
                <View style={styles.pageInfo}>
                  <TouchableOpacity
                    onPress={() => setShowPageJump(!showPageJump)}
                  >
                    <Text style={styles.pageText}>
                      {currentPage} / {pageCount}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Spacer when image (so buttons push right) */}
              {isImage && <View style={{ flex: 1 }} />}

              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleDownloadPdf}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather name="download" size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={onPressToggleFavorite}
              >
                <Ionicons
                  name={isFavorite ? "star" : "star-outline"}
                  size={24}
                  color={isFavorite ? Colors.universal.favorite : "#fff"}
                />
              </TouchableOpacity>

              {/* Settings – PDFs with multiple pages only
              {!isImage && pageCount > 1 && (
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => setShowSettings(!showSettings)}
                >
                  <Feather name="settings" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )} */}
            </Animated.View>
          ) : null}

          {/* ───── Bottom Navigation Bar – PDFs only ───── */}
          {!isImage && showControls ? (
            <Animated.View
              style={[styles.bottomBar, { opacity: controlsOpacity }]}
            >
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentPage === 1 && styles.navButtonDisabled,
                ]}
                onPress={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <Feather
                  name={
                    effectiveIsHorizontal
                      ? rtl
                        ? "chevron-right"
                        : "chevron-left"
                      : "chevron-up"
                  }
                  size={28}
                  color={currentPage === 1 ? "#6B7280" : "#FFFFFF"}
                />
              </TouchableOpacity>

              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${(currentPage / pageCount) * 100}%` },
                  ]}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentPage === pageCount && styles.navButtonDisabled,
                ]}
                onPress={goToNextPage}
                disabled={currentPage === pageCount}
              >
                <Feather
                  name={
                    effectiveIsHorizontal
                      ? rtl
                        ? "chevron-left"
                        : "chevron-right"
                      : "chevron-down"
                  }
                  size={28}
                  color={currentPage === pageCount ? "#6B7280" : "#FFFFFF"}
                />
              </TouchableOpacity>
            </Animated.View>
          ) : null}

          {/* ───── Settings Menu – PDFs only ───── */}
          {/* {!isImage && showSettings && pageCount > 1 ? (
            <View style={styles.settingsOverlay}>
              <View style={styles.settingsContainer}>
                <View style={styles.settingsHeader}>
                  <Text style={styles.settingsTitle}>
                    {t("readingSettings")}
                  </Text>
                  <TouchableOpacity onPress={() => setShowSettings(false)}>
                    <Feather name="x" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.settingsContent}>
                  <View style={styles.settingSection}>
                    <Text style={styles.settingLabel}>{t("pageLayout")}</Text>
                    <View style={styles.layoutButtons}>
                      <TouchableOpacity
                        style={[
                          styles.layoutButton,
                          isHorizontal && styles.layoutButtonActive,
                        ]}
                        onPress={() => !isHorizontal && toggleLayout()}
                        disabled={pageCount === 1}
                      >
                        <Feather
                          name="columns"
                          size={20}
                          color={isHorizontal ? "#3B82F6" : "#9CA3AF"}
                        />
                        <Text
                          style={[
                            styles.layoutButtonText,
                            isHorizontal && styles.layoutButtonTextActive,
                          ]}
                        >
                          {t("horizontal")}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.layoutButton,
                          !isHorizontal && styles.layoutButtonActive,
                        ]}
                        onPress={() => isHorizontal && toggleLayout()}
                        disabled={pageCount === 1}
                      >
                        <Feather
                          name="align-justify"
                          size={20}
                          color={!isHorizontal ? "#3B82F6" : "#9CA3AF"}
                        />
                        <Text
                          style={[
                            styles.layoutButtonText,
                            !isHorizontal && styles.layoutButtonTextActive,
                          ]}
                        >
                          {t("vertical")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.settingHint}>
                      {pageCount === 1
                        ? "Single-page PDFs always use horizontal layout"
                        : isHorizontal
                          ? t("horizontalInfoText")
                          : t("verticalInfoText")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null} */}

          {/* ───── Page Jump Menu – PDFs only ───── */}
          {!isImage && showPageJump ? (
            <View style={styles.pageJumpOverlay}>
              <View style={styles.pageJumpContainer}>
                <View style={styles.pageJumpHeader}>
                  <Text style={styles.pageJumpTitle}>Jump to Page</Text>
                  <TouchableOpacity onPress={() => setShowPageJump(false)}>
                    <Feather name="x" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.pageJumpScroll}>
                  <Text style={styles.sectionTitle}>All Pages</Text>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                    (page) => (
                      <TouchableOpacity
                        key={page}
                        style={[
                          styles.pageJumpItem,
                          page === currentPage && styles.pageJumpItemActive,
                        ]}
                        onPress={() => {
                          goToPage(page);
                          setShowPageJump(false);
                        }}
                      >
                        <Text style={styles.pageJumpItemText}>Page {page}</Text>
                      </TouchableOpacity>
                    ),
                  )}
                </ScrollView>
              </View>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
};

export default PdfViewerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  containerBlack: {
    backgroundColor: "#000000",
  },
  pdfContainer: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  pdf: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  progressText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 10,
  },
  controlButton: {
    padding: 8,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pageInfo: {
    flex: 1,
    alignItems: "center",
  },
  pageText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 10,
  },
  navButton: {
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },

  settingsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsContainer: {
    width: "85%",
    maxHeight: "70%",
    backgroundColor: "#1F2937",
    borderRadius: 16,
    overflow: "hidden",
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  settingsTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  settingsContent: {
    padding: 16,
  },
  settingSection: {
    marginBottom: 20,
  },
  settingLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  settingHint: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 8,
  },

  layoutButtons: {
    flexDirection: "row",
    gap: 12,
  },
  layoutButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#374151",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  layoutButtonActive: {
    backgroundColor: "#1E3A8A",
    borderColor: "#3B82F6",
  },
  layoutButtonText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "600",
  },
  layoutButtonTextActive: {
    color: "#FFFFFF",
  },

  pageJumpOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  pageJumpContainer: {
    width: "80%",
    maxHeight: "80%",
    backgroundColor: "#1F2937",
    borderRadius: 16,
    overflow: "hidden",
  },
  pageJumpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  pageJumpTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  pageJumpScroll: {
    maxHeight: 400,
  },
  sectionTitle: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: "uppercase",
  },
  pageJumpItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  pageJumpItemActive: {
    backgroundColor: "#374151",
  },
  pageJumpItemText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
