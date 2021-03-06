/// <reference path="FiMFiction.d.ts"/>

declare const gapi: any;

export default class Util {
	/**
	 * Loads a script dynamically by creating a script element and attaching it to the head element.
	 * @param {string} url
	 * @returns {Promise}
	 */
	static loadScript(url: string): Promise<Event> {
		return new Promise<Event>((resolve, reject) => {
			const script = document.createElement("script");
			script.addEventListener("load", resolve);
			script.addEventListener("error", err => {
				console.error("Failed to load script: %s", url);
				reject(err);
			});
			script.src = url;
			document.getElementsByTagName("head")[0].appendChild(script);
		});
	}

	/**
	 * Makes an AJAX GET call, optionally with additional headers.
	 * @param {string} url
	 * @param {object} [options]
	 * @returns {Promise}
	 */
	static getByAjax(url: string, options?): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.addEventListener("load", () => {
				if (xhr.status >= 200 && xhr.status <= 300) {
					resolve(xhr.response);
				} else {
					reject(xhr.response);
				}
			});
			xhr.addEventListener("error", () => {
				reject(xhr.response);
			});
			xhr.open("GET", url, true);
			if (options && options.headers) {
				Object.keys(options.headers).forEach(key => {
					xhr.setRequestHeader(key, options.headers[key]);
				});
			}
			xhr.send();
		});
	}

	/**
	 * Parses an RGB-color-string as returned from `element.style.color` to a CSS hex-notation.
	 * @param {string} rgb
	 * @returns {string|boolean}
	 */
	static rgbToHex(rgb: string): string | boolean {
		if (!rgb || rgb == "inherit" || typeof rgb != "string") return false;
		const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		if (!match) return false;
		const hex = x => ("0" + parseInt(x).toString(16)).slice(-2);
		const c = "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
		return c == "#000000" ? false : c;
	}

	/**
	 * Converts a font size in PT to a font size in EM, assuming default values for DPI.
	 * @param {string} pt
	 * @param {number} [base]
	 * @returns {string|boolean}
	 */
	static ptToEm(pt: string, base?: number): string | boolean {
		if (!pt || typeof pt !== "string" || pt.slice(-2) !== "pt") return false;
		const n = +pt.slice(0, -2);
		if (!base && (n === 11 || n === 12)) return false;
		const em = +(n / (base || 12)).toFixed(3) + "em";
		if (em === "1em") return false;
		return em;
	}

	/**
	 * Turns anything that has a length and an indexer to access values into a proper array.
	 * @param value
	 * @returns {Array}
	 */
	static toArray<T>(value: { length: number, [i: number]: T }): T[] {
		const result = [];
		for (let i = 0; i < value.length; i++) {
			result.push(value[i]);
		}

		return result;
	}

	/**
	 * Parses a Google referrer link and extracts the "q" query parameter from it.
	 * @param {string} link
	 * @returns {string|boolean}
	 */
	static parseGoogleRefLink(link: string): string | boolean {
		const a = window.document.createElement("a");
		a.href = link;
		const queryParams = a.search.substring(1).split("&");
		for (let i = 0; i < queryParams.length; i++) {
			const pair = queryParams[i].split("=");
			if (pair[0] == "q") {
				return decodeURIComponent(pair[1]);
			}
		}

		return false;
	}

	/**
	 * Given a list of headings, shows a popup menu and lets the user decide which heading to choose. If the
	 * headings list contains no elements, no popup is shown and the promise is resolved immediately.
	 * @param {HTMLElement[]} headings
	 * @returns {Promise}
	 */
	static chooseChapter(headings: HTMLElement[]): Promise<HTMLElement> {
		if (headings.length <= 0) {
			return Promise.resolve(null);
		}

		return new Promise(resolve => {
			const content = '<div class="std"><label><a class="styled_button" style="text-align:center;width:100%;">Import Everything</a></label>\n' +
				headings.map(h => '<label><a style="display:inline-block;text-align:center;width:100%;" data-id="' + h.id + '">' + h.textContent + '</a></label>').join("\n") + "</div>";

			const popup = new PopUpMenu("", '<i class="fa fa-th-list"></i> Chapter Selection');
			popup.SetCloseOnHoverOut(false);
			popup.SetCloseOnLinkPressed(true);
			popup.SetSoftClose(true);
			popup.SetWidth(350);
			popup.SetDimmerEnabled(false);
			popup.SetFixed(false);
			popup.SetContent(content);
			popup.SetFooter("The document you want to import seems to contain chapters. Please select a chapter to import.");

			const contentContainer = (popup["content"] as HTMLElement).querySelector(".std");
			contentContainer.addEventListener("click", (e: any) => {
				if (e.target.nodeName != "A") return;
				const hid = e.target.getAttribute("data-id");
				const h = headings.filter(h => h.id === hid);
				resolve(h.length ? h[0] : null);
			});

			// TODO: Leak here when popup canceled? (Promise still open)
			popup.Show();
		});
	}
}
