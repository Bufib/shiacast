import RenderLink from "@/components/RenderLink";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { NewsType } from "@/constants/Types";
import { useLanguage } from "../../contexts/LanguageContext";
import { useColorScheme } from "../../hooks/useColorScheme.web";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { formatDate } from "../../utils/formatDate";
import NewsMenu from "./NewsMenu";

const { width } = Dimensions.get("window");
const CONTAINER_PADDING = 60;
const availableWidth = width - CONTAINER_PADDING;

export const NewsItem = ({
  id,
  title,
  content,
  created_at,
  images_url,
  internal_urls,
  external_urls,
  is_pinned,
  language_code,
}: NewsType) => {
  const colorScheme = useColorScheme() || "light";
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList<string>>(null);
  const { rtl } = useLanguage();
  const [imageDimensions, setImageDimensions] = useState<{
    [key: string]: number;
  }>({});

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / availableWidth);
    setCurrentPage(pageIndex);
  };

  const handleDotPress = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * availableWidth,
      animated: true,
    });
    setCurrentPage(index);
  };

  const handleImageLoad = (url: string, event: any) => {
    const { width: imgWidth, height: imgHeight } = event.source;
    const aspectRatio = imgWidth / imgHeight;
    const calculatedHeight = availableWidth / aspectRatio;

    setImageDimensions((prev) => ({
      ...prev,
      [url]: calculatedHeight,
    }));
  };

  return (
    <View
      style={[
        styles.newsItem,
        {
          backgroundColor: Colors[colorScheme].contrast,
        },
      ]}
    >
      {/* Content grows to fill available space, pushing date to bottom */}
      <View style={styles.newsItemContent}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {title && title.trim() !== "" && (
            <ThemedText
              style={[styles.newsTitle, { textAlign: rtl ? "right" : "left" }]}
              type="defaultSemiBold"
            >
              {title}
            </ThemedText>
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {is_pinned && (
              <AntDesign
                name="pushpin"
                size={24}
                color={colorScheme === "dark" ? "#2ea853" : "#057958"}
                style={styles.pinIconStyle}
              />
            )}

            {isAdmin && <NewsMenu id={id} is_pinned={is_pinned} />}
          </View>
        </View>

        {content && content.trim() !== "" && (
          <ThemedText
            style={[styles.newsContent, { textAlign: rtl ? "right" : "left" }]}
          >
            {content}
          </ThemedText>
        )}

        {external_urls && external_urls.length > 0 && (
          <ThemedView style={styles.linksContainer}>
            {external_urls.map((url, index) => (
              <RenderLink
                key={`external-url-${index}-${url}`}
                url={url}
                index={index}
                isExternal={true}
              />
            ))}
          </ThemedView>
        )}

        {internal_urls && internal_urls.length > 0 && (
          <ThemedView style={styles.linksContainer}>
            {internal_urls.map((url, index) => (
              <RenderLink
                key={`internal-url-${index}-${url}`}
                url={url}
                index={index}
                isExternal={false}
              />
            ))}
          </ThemedView>
        )}
        {/* {images_url && images_url.length > 0 && (
          <View>
            <FlatList
              ref={flatListRef}
              data={images_url}
              horizontal
              scrollEnabled={images_url.length > 1}
              pagingEnabled
              decelerationRate="normal"
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScrollEnd}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => {
                const imageHeight = imageDimensions[item] || availableWidth;
                return (
                  <View
                    style={[styles.imageContainer, { height: imageHeight }]}
                  >
                    <Image
                      source={{ uri: item }}
                      style={[styles.image, { height: imageHeight }]}
                      contentFit="cover"
                      allowDownscaling={true}
                      onLoad={(event) => handleImageLoad(item, event)}
                    />
                  </View>
                );
              }}
            />
            {images_url.length > 1 && (
              <View style={styles.dotsContainer}>
                {images_url.map((_, index) => (
                  <Pressable key={index} onPress={() => handleDotPress(index)}>
                    <View
                      style={[
                        styles.dot,
                        currentPage === index
                          ? styles.activeDot
                          : styles.inactiveDot,
                      ]}
                    />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )} */}
      </View>

      {/* Date always at the bottom */}
      <ThemedText
        style={[styles.newsDate, { textAlign: rtl ? "left" : "right" }]}
      >
        {formatDate(created_at)}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  newsItem: {
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    width: 300,
    height: 180,
    justifyContent: "space-between",
  },
  newsItemContent: {
    flex: 1,
  },

  pinIconStyle: {},
  newsMenu: {
    backgroundColor: "transparent",
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 30,
  },
  newsContent: {
    fontSize: 18,
    marginBottom: 20,
    lineHeight: 28,
  },
  linksContainer: {
    backgroundColor: "transparent",
  },
  imageContainer: {
    width: availableWidth,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  image: {
    width: availableWidth,
    borderRadius: 8,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#000",
  },
  inactiveDot: {
    backgroundColor: "#A4B0BD",
  },
  newsDate: {
    fontSize: 14,
    color: Colors.universal.grayedOut,
  },
});
