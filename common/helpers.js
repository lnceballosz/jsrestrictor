//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>
//
// SPDX-FileCopyrightText: 2020 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-License-Identifier: GPL-3.0-or-later
//

function escape(str) {
	var map =	{
		'"': '&quot;',
		"'": '&#039;',
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;'
	};
	return str.replace(/["'&<>]/g, (c) =>  map[c]);
}

/**
 * Generate random 32-bit number.
 */
function gen_random32() {
	var array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	return array[0];
}

/**
 * Remove "www." at the beggining of the given hostname.
 */
function wwwRemove(hostname) {
	return String(hostname).replace(/^www\./,'');
}
