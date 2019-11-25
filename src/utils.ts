export function clampDeg(deg: number): number {
	return (deg + 360) % 360;
}


/**
 * Generates a lookup table for trigonometric functions
 * The keys will be the degrees times 10, so we can easily round to 0.1 degree
 * @param trigonometricFunction
 */
function getLookupTable(trigonometricFunction: (rad: number) => number): { [deg: number]: number } {
	const lookup: { [deg: number]: number } = {};
	for (let i = 0; i <= 360; i += 1) {
		lookup[Math.round(i)] = trigonometricFunction(i / 180 * Math.PI);
	}
	return lookup;
}

const cosLookupTable: { [deg: number]: number } = getLookupTable(Math.cos);
const sinLookupTable: { [deg: number]: number } = getLookupTable(Math.sin);
const tanLookupTable: { [deg: number]: number } = getLookupTable(Math.tan);

function lookupAndInterpolate(deg: number, lookupTable: { [deg: number]: number }): number {
	const lowerDeg = Math.floor(deg);
	const upperDeg = Math.ceil(deg + 0.00001);
	const lowerTri = lookupTable[lowerDeg];
	const upperTri = lookupTable[upperDeg];
	const diffDeg = upperDeg - lowerDeg;
	const diffCos = upperTri - lowerTri;
	return lowerTri + Math.abs(deg - lowerDeg) / diffDeg * diffCos;
}

export function cos(deg: number): number {
	return lookupAndInterpolate(deg, cosLookupTable);
}

export function sin(deg: number): number {
	return lookupAndInterpolate(deg, sinLookupTable);
}

export function tan(deg: number): number {
	return lookupAndInterpolate(deg, tanLookupTable);
}
