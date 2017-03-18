import Util from "./Util";

export default [
	{
		test: element => element.style.textAlign == "center",
		tag: "center"
	},
	{
		test: element => element.style.fontWeight == 700,
		tag: "b"
	},
	{
		test: element => element.style.fontStyle == "italic",
		tag: "i"
	},
	{
		test: element => element.style.textDecoration == "underline",
		tag: "u"
	},
	{
		test: element => element.style.textDecoration == "line-through",
		tag: "s"
	},
	{
		test: element => Util.rgbToHex(element.style.color),
		prefix: test => "[color=" + test + "]",
		postfix: () => "[/color]"
	},
	{
		test: element => Util.ptToEm(element.style.fontSize),
		prefix: test => "[size=" + test + "]",
		postfix: () => "[/size]"
	}
];