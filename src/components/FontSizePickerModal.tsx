// import React, { useEffect, useMemo, useState } from "react";
// import { Modal, StyleSheet, Pressable, useColorScheme } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import { Colors } from "@/constants/Colors";
// import { useFontSizeStore } from "../../stores/fontSizeStore";
// import { useTranslation } from "react-i18next";

// interface FontSizePickerModalProps {
//   visible: boolean;
//   onClose: () => void;
// }

// const FontSizePickerModal: React.FC<FontSizePickerModalProps> = ({
//   visible,
//   onClose,
// }) => {
//   const colorScheme = useColorScheme() || "light";
//   const { fontSize, setFontSize, setLineHeight } = useFontSizeStore();

//   const { t } = useTranslation();
//   const fontSizeOptions = useMemo(
//     () => [
//       { label: t("small"), fontSize: 16, lineHeight: 28 },
//       { label: t("medium"), fontSize: 18, lineHeight: 35 },
//       { label: t("large"), fontSize: 22, lineHeight: 40 },
//     ],
//     [t]
//   );

//   const [pickerValue, setPickerValue] = useState(
//     fontSizeOptions.find((option) => option.fontSize === fontSize)?.label
//   );

//   useEffect(() => {
//     if (visible) {
//       // Sync picker value with Zustand state
//       const selectedOption = fontSizeOptions.find(
//         (option) => option.fontSize === fontSize
//       );
//       setPickerValue(selectedOption?.label || "Mittel");
//     }
//   }, [visible, fontSize, fontSizeOptions]);

//   return (
//     <Modal
//       visible={visible}
//       transparent={true}
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       {/* Modal Background */}
//       <Pressable style={styles.modalContainer} onPress={onClose}>
//         {/* Modal Content */}
//         <Pressable
//           style={[
//             styles.pickerContainer,
//             {
//               borderColor: Colors[colorScheme].border,
//               backgroundColor: Colors[colorScheme].contrast,
//             },
//           ]}
//           onPress={() => {}}
//         >
//           <Picker
//             selectedValue={pickerValue}
//             onValueChange={(itemValue) => {
//               setPickerValue(itemValue);

//               const selectedOption = fontSizeOptions.find(
//                 (option) => option.label === itemValue
//               );

//               if (selectedOption) {
//                 setFontSize(selectedOption.fontSize);
//                 setLineHeight(selectedOption.lineHeight);
//               }

//               // Dismiss the picker modal
//               onClose();
//             }}
//           >
//             {fontSizeOptions.map((option) => (
//               <Picker.Item
//                 key={option.label}
//                 label={option.label}
//                 value={option.label}
//                 color={Colors[colorScheme].text}
//               />
//             ))}
//           </Picker>
//         </Pressable>
//       </Pressable>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   pickerContainer: {
//     width: 300,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 20,
//     borderWidth: 1,
//   },
// });

// export default FontSizePickerModal;


import React, { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Pressable, useColorScheme } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "@/constants/Colors";
import { useFontSizeStore } from "../../stores/fontSizeStore";
import { useTranslation } from "react-i18next";

interface FontSizePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

const FontSizePickerModal: React.FC<FontSizePickerModalProps> = ({
  visible,
  onClose,
}) => {
  const colorScheme = useColorScheme() || "light";
  const { fontSize, setFontSize } = useFontSizeStore();
  const { t } = useTranslation();

  const fontSizeOptions = useMemo(
    () => [
      { label: t("small"), fontSize: 16 },
      { label: t("medium"), fontSize: 18 },
      { label: t("large"), fontSize: 22 },
    ],
    [t]
  );

  const [pickerValue, setPickerValue] = useState(
    fontSizeOptions.find((opt) => opt.fontSize === fontSize)?.label ??
      fontSizeOptions[1].label
  );

  useEffect(() => {
    if (visible) {
      const match = fontSizeOptions.find((opt) => opt.fontSize === fontSize);
      setPickerValue(match?.label ?? fontSizeOptions[1].label);
    }
  }, [visible, fontSize, fontSizeOptions]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalContainer} onPress={onClose}>
        <Pressable
          style={[
            styles.pickerContainer,
            {
              borderColor: Colors[colorScheme].border,
              backgroundColor: Colors[colorScheme].contrast,
            },
          ]}
          onPress={() => {}}
        >
          <Picker
            selectedValue={pickerValue}
            onValueChange={(itemValue) => {
              setPickerValue(itemValue);
              const selected = fontSizeOptions.find(
                (opt) => opt.label === itemValue
              );
              if (selected) setFontSize(selected.fontSize);
              onClose();
            }}
          >
            {fontSizeOptions.map((option) => (
              <Picker.Item
                key={option.label}
                label={option.label}
                value={option.label}
                color={Colors[colorScheme].text}
              />
            ))}
          </Picker>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    width: 300,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
  },
});

export default FontSizePickerModal;