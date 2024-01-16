const Module = require("./deca/support/wasm/deca_adf");

exports.compareArray = (a, b, n) => {
  let b2 = b;
  if (typeof b === "string") {
    b2 = [];
    for (let i = 0; i < b.length; i++) {
      b2.push(b.charCodeAt(i));
    }
  }

  for (let i = 0; i < n; ++i) {
    if (a[i] !== b2[i]) {
      return false;
    }
  }

  return true;
};

exports.adfProcess = (bin_js) => {
  const sz = bin_js.byteLength;
  const bin_offset = Module._alloc_bin(sz);
  let bin_wasm = new Uint8Array(Module.HEAPU8.buffer, bin_offset, sz);
  bin_wasm.set(bin_js);

  Module.adf_stack = [];
  const result = Module._process_adf(bin_offset, sz);

  let adf = null;
  if (result && Module.adf_stack.length > 0) {
    adf = Module.adf_stack.pop();
    Module.adf_stack = [];
  }
  return adf;
};
