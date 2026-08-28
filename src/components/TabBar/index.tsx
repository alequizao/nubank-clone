import {
	BottomTabDescriptorMap,
	BottomTabNavigationEventMap,
} from "@react-navigation/bottom-tabs/lib/typescript/src/types";
import {
	NavigationHelpers,
	ParamListBase,
	TabNavigationState,
} from "@react-navigation/native";
import React from "react";
import {
	View,
	TouchableOpacity,
	Platform,
	StyleSheet,
	Text,
} from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

const styles = StyleSheet.create({
	// A barra fica presa ao rodapé da tela, centralizada e sempre por cima —
	// sem isso ela ficava sobrepondo os cards no mobile.
	container: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: "center",
		// O recorte inferior do aparelho já é tratado pelo CSS do index.php;
		// aqui fica só o respiro da barra flutuante.
		paddingBottom: Platform.OS === "ios" ? 22 : 18,
		backgroundColor: "transparent",
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		paddingHorizontal: 10,
		paddingVertical: 6,
		backgroundColor: "#ffffff",
		borderRadius: 48,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#EDEDED",
		elevation: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.16,
		shadowRadius: 10,
	},
	buttonTab: {
		justifyContent: "center",
		alignItems: "center",
		padding: 4,
	},
	innerButton: {
		width: 46,
		height: 46,
		borderRadius: 23,
		justifyContent: "center",
		alignItems: "center",
	},
});

interface Props {
	state: TabNavigationState<ParamListBase>;
	descriptors: BottomTabDescriptorMap;
	navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
	insets?: EdgeInsets;
}

const TabBar: React.FC<Props> = ({ state, descriptors, navigation }) => {
	return (
		<View style={styles.container}>
			<View style={styles.content}>
				{state.routes?.map((route, index) => {
					const { options } = descriptors[route.key];

					const isFocused = state.index === index;

					const onPress = () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate({
								name: route.name,
								merge: true,
								params: {},
							});
						}
					};

					const onLongPress = () => {
						navigation.emit({
							type: "tabLongPress",
							target: route.key,
						});
					};

					return (
						<TouchableOpacity
							accessibilityRole="button"
							accessibilityState={
								isFocused ? { selected: true } : {}
							}
							accessibilityLabel={
								options.tabBarAccessibilityLabel
							}
							testID={options.tabBarTestID}
							onPress={onPress}
							onLongPress={onLongPress}
							style={styles.buttonTab}
							key={index}
						>
							<View
								style={[
									styles.innerButton,
									{
										backgroundColor: isFocused
											? "#f8e2fd"
											: "transparent",
									},
								]}
							>
								<MaterialIcons
									name={
										options.title === "compare-arrows"
											? "compare-arrows"
											: options.title === "attach-money"
											? "attach-money"
											: "storefront"
									}
									size={28}
									color={isFocused ? "#8f2adb" : "#535353"}
								/>
							</View>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
};

export default TabBar;
