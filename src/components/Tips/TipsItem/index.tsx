import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#F4F4F5",
		width: 250,
		minHeight: 96,
		borderRadius: 14,
		paddingHorizontal: 18,
		paddingVertical: 16,
		justifyContent: "center",
	},
	newsText: {
		fontSize: 15,
		lineHeight: 21,
		color: "#111111",
	},
});

interface Props {
	desc: string;
}

const NewsItem: React.FC<Props> = ({ desc }) => {
	return (
		<TouchableOpacity>
			<View style={styles.container}>
				<Text style={styles.newsText}>{desc}</Text>
			</View>
		</TouchableOpacity>
	);
};

export default NewsItem;
