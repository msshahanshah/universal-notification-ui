import { emailRegex } from './constants';

const validateSingleEmail = (email: string) => emailRegex.test(email.trim());

const validateMultipleEmails = (value: string) => {
  const trimmedValue = value?.trim();
  return trimmedValue
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
    .every(validateSingleEmail);
};

function isBodyEmpty(html: any) {
  if (!html) return true;

  const div = document.createElement('div');
  div.innerHTML = html;

  // Get text content and trim whitespace
  return div.textContent.trim().length === 0;
}

const truncateString = (value: string, maxLength: number) => {
  if (!value) return '';
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength) + '...';
};

function renameDuplicateFiles(files: File[]): File[] {
  const nameCount = new Map<string, number>();

  return files.map((file) => {
    const originalName = file.name;
    const dotIndex = originalName.lastIndexOf('.');

    const baseName =
      dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;

    const extension = dotIndex !== -1 ? originalName.slice(dotIndex) : '';

    // Initialize counter
    if (!nameCount.has(baseName)) {
      nameCount.set(baseName, 0);
      // console.log(`File ${index}: Keeping original name "${originalName}"`);
      return file; // first occurrence stays same
    }

    // Increment count
    const count = nameCount.get(baseName)! + 1;
    nameCount.set(baseName, count);

    const newName = `${baseName}${count}${extension}`;
    const newFile = new File([file], newName, { type: file.type });

    // console.log(`File ${index}: Renamed from "${originalName}" to "${newName}"`, {
    //   originalSize: file.size,
    //   newSize: newFile.size,
    //   originalLastModified: file.lastModified,
    //   newLastModified: newFile.lastModified,
    //   sameContent: file.size === newFile.size
    // });

    return newFile;
  });
}

export {
  validateMultipleEmails,
  validateSingleEmail,
  truncateString,
  isBodyEmpty,
  renameDuplicateFiles,
};
