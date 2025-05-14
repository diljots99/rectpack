// guillotine.js
const {
  GuillotineBssfSas, GuillotineBssfLas,
  GuillotineBssfSlas, GuillotineBssfLlas,
  GuillotineBssfMaxas, GuillotineBssfMinas,
  GuillotineBlsfSas, GuillotineBlsfLas,
  GuillotineBlsfSlas, GuillotineBlsfLlas,
  GuillotineBlsfMaxas, GuillotineBlsfMinas,
  GuillotineBafSas, GuillotineBafLas,
  GuillotineBafSlas, GuillotineBafLlas,
  GuillotineBafMaxas, GuillotineBafMinas
} = require('./src/rectpack/guillotine.js');

// packer.js - classes and functions
const {
  float2dec,
  SORT_AREA,
  SORT_PERI,
  SORT_DIFF,
  SORT_SSIDE,
  SORT_LSIDE,
  SORT_RATIO,
  SORT_NONE,
  BinFactory,
  PackerBNFMixin,
  PackerBFFMixin,
  PackerBBFMixin,
  PackerOnline,
  PackingMode,
  PackingBin,
  newPacker
} = require('./src/rectpack/packer.js');

const {     MaxRectsBl,
  MaxRectsBssf,
  MaxRectsBaf,
  MaxRectsBlsf } = require('./src/rectpack/maxrects.js');

// Exports
module.exports = {
  GuillotineBssfSas, GuillotineBssfLas,
  GuillotineBssfSlas, GuillotineBssfLlas,
  GuillotineBssfMaxas, GuillotineBssfMinas,
  GuillotineBlsfSas, GuillotineBlsfLas,
  GuillotineBlsfSlas, GuillotineBlsfLlas,
  GuillotineBlsfMaxas, GuillotineBlsfMinas,
  GuillotineBafSas, GuillotineBafLas,
  GuillotineBafSlas, GuillotineBafLlas,
  GuillotineBafMaxas, GuillotineBafMinas,
  MaxRectsBl,
  MaxRectsBssf,
  MaxRectsBaf,
  MaxRectsBlsf,
  float2dec,
  SORT_AREA,
  SORT_PERI,
  SORT_DIFF,
  SORT_SSIDE,
  SORT_LSIDE,
  SORT_RATIO,
  SORT_NONE,
  BinFactory,
  PackerBNFMixin,
  PackerBFFMixin,
  PackerBBFMixin,
  PackerOnline,
  PackingMode,
  PackingBin,
  newPacker
};

if (typeof window !== 'undefined') {
  window.newPacker = newPacker;
  window.PackingMode = PackingMode;
  window.PackingBin = PackingBin;
  window.SORT_AREA = SORT_AREA;
  window.GuillotineBssfSas = GuillotineBssfSas;
  window.MaxRectsBl = MaxRectsBl;
  window.MaxRectsBssf = MaxRectsBssf
  window.MaxRectsBaf = MaxRectsBaf
  window.MaxRectsBlsf = MaxRectsBlsf
}


