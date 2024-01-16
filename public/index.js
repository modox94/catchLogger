const initial_message = "Drop player_data file here...\n";

// handle dropping files onto page
const dropzone = document.getElementById("dropzone");
dropzone.addEventListener("dragenter", handlerDropzone, false);
dropzone.addEventListener("dragleave", handlerDropzone, false);
dropzone.addEventListener("dragover", handlerDropzone, false);
dropzone.addEventListener("drop", handlerDropzoneDrop, false);
dropzone.innerText = initial_message;

function handlerDropzone(e) {
  e.preventDefault();
  e.stopPropagation();
  // console.log(e)
}

async function handlerDropzoneDrop(e) {
  e.preventDefault();
  e.stopPropagation();

  let items = e.dataTransfer.items;

  const entriesArray = await getEntriesArray(items);
  const filesArray = [];

  // We can't do this before because some root files become unreachable if we try to get them while collecting.
  for (const pair of entriesArray) {
    const entry = pair[1];
    const file = await getFile(entry);
    filesArray.push([pair[0], file]);
  }

  const formData = new FormData();
  filesArray.forEach((el) => {
    const [path, file] = el;
    formData.set(path, file);
  });

  const requestOptions = {
    method: "POST",
    body: formData,
  };

  const response = await fetch("api/upload", requestOptions);
  const data = await response.json();

  dropzone.innerText = JSON.stringify(data, undefined, 2);
}

async function getEntriesArray(dataTransferItems) {
  const result = [];
  const length = dataTransferItems?.length;
  if (!Number.isFinite(length) || length <= 0) {
    return result;
  }

  const dirQueue = [];

  for (const item of dataTransferItems) {
    const entry =
      typeof item?.webkitGetAsEntry === "function"
        ? item.webkitGetAsEntry()
        : item;

    if (entry?.isFile) {
      let fullPath = entry.fullPath || "";
      fullPath = fullPath[0] === "/" ? fullPath.slice(1) : fullPath;
      result.push([fullPath, entry]);
    } else if (entry?.isDirectory) {
      dirQueue.push(entry);
    }
  }

  // For some reasons after reading folders some root files become unreachable, so it is necessary to read folders after files.
  for (const dir of dirQueue) {
    const allEntries = await readAllEntries(dir);
    const filesFromDir = await getEntriesArray(allEntries);
    result.push(...filesFromDir);
  }

  return result;
}

async function getFile(fileEntry) {
  try {
    return new Promise((resolve, reject) => fileEntry.file(resolve, reject));
  } catch (err) {
    console.log(err);
  }
}

async function readAllEntries(entry) {
  const reader = entry.createReader();

  return new Promise((resolve) => {
    const itemsInDirectory = [];
    const readEntries = () => {
      // On Chrome 77, readEntries() will only return the first 100 FileSystemEntry instances.
      // In order to obtain all of the instances, readEntries() must be called multiple times.
      reader.readEntries((entries) => {
        if (!entries.length) {
          // Done iterating this particular directory
          resolve(itemsInDirectory);
        } else {
          itemsInDirectory.push(...entries);
          // Try calling readEntries() again for the same dir, according to spec
          readEntries();
        }
      });
    };
    readEntries();
  });
}
