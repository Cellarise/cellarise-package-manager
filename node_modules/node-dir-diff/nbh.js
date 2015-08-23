/**
 * Extracted from three.js
 *
 * @author mrdoob / http://mrdoob.com/
 * @author *kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */
(function () {

	var root = this;

	WhatAmI = function (params, cb) {

		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;

	};

	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = Vector3;
		}
		exports = WhatAmI;
	} else {
		root.WhatAmI = WhatAmI;
	}
}).call(this);
