// import { PodcastGridCardType } from "@/constants/Types";
// import { Image } from "expo-image";
// import { StyleSheet, Text, View } from "react-native";
// import { formatDate } from "../../utils/formatDate";
// import { Feather } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useIsPodcastListened } from "@/hooks/usePodcastListenedStore";

// export default function PodcastGridCard({
//   podcast,
//   width,
//   rtl,
//   lang,
//   listenText,
//   gradientColors,
// }: PodcastGridCardType) {
//   const formattedDate = formatDate(podcast.created_at);
//   const hasCover = Boolean(podcast.image_url);
//   const isListened = useIsPodcastListened(podcast?.id, lang);

//   return (
//     <View style={[styles.cardShadow, { width }]}>
//       <View style={[styles.card, isListened && styles.cardListened]}>
//         {hasCover ? (
//           <>
//             <Image
//               source={{ uri: podcast.image_url! }}
//               style={StyleSheet.absoluteFill}
//               contentFit="cover"
//             />

//             <LinearGradient
//               colors={[
//                 "rgba(0,0,0,0.15)",
//                 "rgba(0,0,0,0.4)",
//                 "rgba(0,0,0,0.8)",
//               ]}
//               locations={[0, 0.5, 1]}
//               style={StyleSheet.absoluteFill}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 0, y: 1 }}
//             />
//           </>
//         ) : (
//           <>
//             <LinearGradient
//               style={StyleSheet.absoluteFill}
//               colors={gradientColors as any}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//             />

//             <View style={styles.cardOverlay} />
//           </>
//         )}

//         <View
//           style={[
//             styles.vinylRecord,
//             rtl ? styles.vinylRecordRtl : styles.vinylRecordLtr,
//           ]}
//         >
//           <Feather name="mic" size={18} color="#fff" />
//         </View>

//         {isListened && (
//           <View
//             style={[
//               styles.listenedBadge,
//               rtl ? styles.listenedBadgeRtl : styles.listenedBadgeLtr,
//             ]}
//           >
//             <Feather name="check" size={16} color="#fff" />
//           </View>
//         )}

//         <View style={styles.cardContent}>
//           <View style={styles.titleContainer}>
//             <Text
//               style={[
//                 styles.cardTitle,
//                 {
//                   textAlign: lang === "ar" ? "right" : "left",
//                   writingDirection: rtl ? "rtl" : "ltr",
//                 },
//               ]}
//               numberOfLines={4}
//               ellipsizeMode="tail"
//             >
//               {podcast.title}
//             </Text>
//           </View>

//           <View style={styles.cardFooter}>
//             <View
//               style={[
//                 styles.playSection,
//                 { flexDirection: rtl ? "row-reverse" : "row" },
//               ]}
//             >
//               <View style={styles.playButton}>
//                 <Feather name="play" size={13} color="#FFFFFF" />
//               </View>

//               <Text
//                 style={[
//                   styles.playText,
//                   rtl ? styles.playTextRtl : styles.playTextLtr,
//                 ]}
//                 numberOfLines={1}
//               >
//                 {listenText}
//               </Text>
//             </View>

//             <Text
//               style={[
//                 styles.createdAt,
//                 {
//                   textAlign: rtl ? "left" : "right",
//                   writingDirection: rtl ? "rtl" : "ltr",
//                 },
//               ]}
//               numberOfLines={1}
//             >
//               {formattedDate}
//             </Text>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   cardShadow: {
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.18,
//     shadowRadius: 4,
//     elevation: 3,
//     overflow: "visible",
//   },

//   card: {
//     width: "100%",
//     height: 230,
//     borderRadius: 26,
//     position: "relative",
//     overflow: "hidden",
//     backgroundColor: "#1a1a1a",
//   },

//   cardListened: {
//     opacity: 0.78,
//   },

//   cardOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0, 0, 0, 0.2)",
//     zIndex: 1,
//   },

//   vinylRecord: {
//     position: "absolute",
//     top: 12,
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     backgroundColor: "rgba(0, 0, 0, 0.22)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 3,
//   },

//   vinylRecordLtr: {
//     right: 12,
//   },

//   vinylRecordRtl: {
//     left: 12,
//   },

//   listenedBadge: {
//     position: "absolute",
//     top: 12,
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: "rgba(46, 204, 113, 0.95)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.25,
//     shadowRadius: 2,
//     elevation: 4,
//   },

//   listenedBadgeLtr: {
//     left: 12,
//   },

//   listenedBadgeRtl: {
//     right: 12,
//   },

//   cardContent: {
//     flex: 1,
//     padding: 16,
//     justifyContent: "space-between",
//     zIndex: 2,
//   },

//   titleContainer: {
//     flex: 1,
//     justifyContent: "center",
//     paddingTop: 44,
//     marginBottom: 12,
//   },

//   cardTitle: {
//     fontSize: 17,
//     fontWeight: "900",
//     color: "#FFFFFF",
//     lineHeight: 22,
//     letterSpacing: -0.3,
//     textShadowColor: "rgba(0, 0, 0, 0.45)",
//     textShadowOffset: {
//       width: 0,
//       height: 0,
//     },
//     textShadowRadius: 4,
//   },

//   cardFooter: {
//     gap: 8,
//   },

//   playSection: {
//     alignItems: "center",
//   },

//   playButton: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: "rgba(255, 255, 255, 0.28)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   playText: {
//     flex: 1,
//     fontSize: 11,
//     fontWeight: "800",
//     color: "rgba(255, 255, 255, 0.9)",
//     letterSpacing: 0.8,
//     textTransform: "uppercase",
//   },

//   playTextLtr: {
//     marginLeft: 8,
//   },

//   playTextRtl: {
//     marginRight: 8,
//   },

//   createdAt: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: "rgba(255, 255, 255, 0.78)",
//     letterSpacing: 0.4,
//     textTransform: "uppercase",
//   },
// });

import { PodcastGridCardType } from "@/constants/Types";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { formatDate } from "../../utils/formatDate";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useIsPodcastListened } from "@/hooks/usePodcastListenedStore";

type Props = PodcastGridCardType & { height?: number };

export default function PodcastGridCard({
  podcast,
  width,
  height,
  rtl,
  lang,
  listenText,
  gradientColors,
}: Props) {
  const formattedDate = formatDate(podcast.created_at);
  const hasCover = Boolean(podcast.image_url);
  const isListened = useIsPodcastListened(podcast?.id, lang);

  return (
    <View style={[styles.cardShadow, { width }]}>
      <View
        style={[
          styles.card,
          isListened && styles.cardListened,
          height ? { height } : null,
        ]}
      >
        {hasCover ? (
          <>
            <Image
              source={{ uri: podcast.image_url! }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />

            <LinearGradient
              colors={[
                "rgba(0,0,0,0.15)",
                "rgba(0,0,0,0.4)",
                "rgba(0,0,0,0.8)",
              ]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </>
        ) : (
          <>
            <LinearGradient
              style={StyleSheet.absoluteFill}
              colors={gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.cardOverlay} />
          </>
        )}

        <View
          style={[
            styles.vinylRecord,
            rtl ? styles.vinylRecordRtl : styles.vinylRecordLtr,
          ]}
        >
          <Feather name="mic" size={18} color="#fff" />
        </View>

        {isListened && (
          <View
            style={[
              styles.listenedBadge,
              rtl ? styles.listenedBadgeRtl : styles.listenedBadgeLtr,
            ]}
          >
            <Feather name="check" size={16} color="#fff" />
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.cardTitle,
                {
                  textAlign: lang === "ar" ? "right" : "left",
                  writingDirection: rtl ? "rtl" : "ltr",
                },
              ]}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {podcast.title}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View
              style={[
                styles.playSection,
                { flexDirection: rtl ? "row-reverse" : "row" },
              ]}
            >
              <View style={styles.playButton}>
                <Feather name="play" size={13} color="#FFFFFF" />
              </View>

              <Text
                style={[
                  styles.playText,
                  rtl ? styles.playTextRtl : styles.playTextLtr,
                ]}
                numberOfLines={1}
              >
                {listenText}
              </Text>
            </View>

            <Text
              style={[
                styles.createdAt,
                {
                  textAlign: rtl ? "left" : "right",
                  writingDirection: rtl ? "rtl" : "ltr",
                },
              ]}
              numberOfLines={1}
            >
              {formattedDate}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
    overflow: "visible",
  },

  card: {
    width: "100%",
    height: 230,
    borderRadius: 26,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },

  cardListened: {
    opacity: 0.78,
  },

  cardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    zIndex: 1,
  },

  vinylRecord: {
    position: "absolute",
    top: 12,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },

  vinylRecordLtr: {
    right: 12,
  },

  vinylRecordRtl: {
    left: 12,
  },

  listenedBadge: {
    position: "absolute",
    top: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(46, 204, 113, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 4,
  },

  listenedBadgeLtr: {
    left: 12,
  },

  listenedBadgeRtl: {
    right: 12,
  },

  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    zIndex: 2,
  },

  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 22,
    letterSpacing: -0.3,
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 4,
  },

  cardFooter: {
    gap: 8,
  },

  playSection: {
    alignItems: "center",
  },

  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    justifyContent: "center",
    alignItems: "center",
  },

  playText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  playTextLtr: {
    marginLeft: 8,
  },

  playTextRtl: {
    marginRight: 8,
  },

  createdAt: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.78)",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
