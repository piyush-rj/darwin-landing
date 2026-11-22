import { geoEquirectangular, geoPath } from "d3-geo";
import type { Feature, MultiLineString } from "geojson";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

export type GlobeAtlas = {
    countries: Feature[];
    countryIndexByName: Map<string, number>;
    outlines: MultiLineString;
    dots: GlobeDots;
};

export type GlobeDots = {
    count: number;
    sinLatitude: Float32Array;
    cosLatitude: Float32Array;
    longitude: Float32Array;
    country: Uint16Array;
    seed: Float32Array;
    restTone: Uint8Array;
};

export const REST_TONE = { hidden: 0, light: 1, dense: 2 } as const;

const DENSE_COUNTRY_THRESHOLD = 0.68;

const RASTER_WIDTH = 2048;
const RASTER_HEIGHT = 1024;
const DOT_SPACING_DEGREES = 0.5;
const SOUTHERNMOST_LATITUDE = -56;
const NORTHERNMOST_LATITUDE = 83;
const RADIANS = Math.PI / 180;

function hash(value: number) {
    const sine = Math.sin(value * 127.1 + 311.7) * 43758.5453;
    return sine - Math.floor(sine);
}

function paintCountryIndexRaster(countries: Feature[]) {
    const canvas = document.createElement("canvas");
    canvas.width = RASTER_WIDTH;
    canvas.height = RASTER_HEIGHT;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas 2D is unavailable");

    const projection = geoEquirectangular()
        .scale(RASTER_WIDTH / (2 * Math.PI))
        .translate([RASTER_WIDTH / 2, RASTER_HEIGHT / 2]);
    const path = geoPath(projection, context);

    countries.forEach((country, index) => {
        const code = index + 1;
        context.fillStyle = `rgb(${code & 255}, ${code >> 8}, 0)`;
        context.beginPath();
        path(country);
        context.fill();
    });

    return context.getImageData(0, 0, RASTER_WIDTH, RASTER_HEIGHT).data;
}

function countryAt(raster: Uint8ClampedArray, column: number, row: number) {
    const offset = (row * RASTER_WIDTH + column) * 4;
    if (raster[offset + 3] !== 255) return 0;
    return raster[offset] + (raster[offset + 1] << 8);
}

function sampleDots(raster: Uint8ClampedArray): GlobeDots {
    const sinLatitude: number[] = [];
    const cosLatitude: number[] = [];
    const longitude: number[] = [];
    const country: number[] = [];
    const seed: number[] = [];
    let serial = 0;

    for (
        let latitude = SOUTHERNMOST_LATITUDE;
        latitude <= NORTHERNMOST_LATITUDE;
        latitude += DOT_SPACING_DEGREES
    ) {
        const longitudeStep = DOT_SPACING_DEGREES / Math.max(0.2, Math.cos(latitude * RADIANS));
        for (let lon = -180; lon < 180; lon += longitudeStep) {
            serial += 1;
            const jitteredLatitude = latitude + (hash(serial) - 0.5) * DOT_SPACING_DEGREES * 0.8;
            const jitteredLongitude = lon + (hash(serial + 0.5) - 0.5) * longitudeStep * 0.8;
            const column = Math.floor(((jitteredLongitude + 180) / 360) * RASTER_WIDTH);
            const row = Math.floor(((90 - jitteredLatitude) / 180) * RASTER_HEIGHT);
            if (column < 1 || column >= RASTER_WIDTH - 1 || row < 1 || row >= RASTER_HEIGHT - 1) {
                continue;
            }
            const code = countryAt(raster, column, row);
            const interior =
                code !== 0 &&
                countryAt(raster, column - 1, row) === code &&
                countryAt(raster, column + 1, row) === code &&
                countryAt(raster, column, row - 1) === code &&
                countryAt(raster, column, row + 1) === code;
            if (!interior) continue;

            sinLatitude.push(Math.sin(jitteredLatitude * RADIANS));
            cosLatitude.push(Math.cos(jitteredLatitude * RADIANS));
            longitude.push(jitteredLongitude * RADIANS);
            country.push(code - 1);
            seed.push(hash(serial + 0.25));
        }
    }

    const restTone = Uint8Array.from(country, (countryIndex, index) => {
        const density = countryDensity(countryIndex);
        if (seed[index] >= density) return REST_TONE.hidden;
        return density > DENSE_COUNTRY_THRESHOLD ? REST_TONE.dense : REST_TONE.light;
    });

    return {
        count: country.length,
        sinLatitude: Float32Array.from(sinLatitude),
        cosLatitude: Float32Array.from(cosLatitude),
        longitude: Float32Array.from(longitude),
        country: Uint16Array.from(country),
        seed: Float32Array.from(seed),
        restTone,
    };
}

let atlasPromise: Promise<GlobeAtlas> | null = null;

export function loadGlobeAtlas() {
    atlasPromise ??= import("world-atlas/countries-50m.json").then(({ default: atlas }) => {
        const topology = atlas as unknown as Topology<{
            countries: GeometryCollection<{ name: string }>;
        }>;
        const collection = feature(topology, topology.objects.countries);
        const countries = collection.features;
        const countryIndexByName = new Map(
            countries.map((country, index) => [String(country.properties?.name), index]),
        );
        const outlines = mesh(topology, topology.objects.countries);
        const dots = sampleDots(paintCountryIndexRaster(countries));
        return { countries, countryIndexByName, outlines, dots };
    });
    return atlasPromise;
}

function countryDensity(countryIndex: number) {
    return 0.18 + hash(countryIndex + 7) * 0.62;
}
