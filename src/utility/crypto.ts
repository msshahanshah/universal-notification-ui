// const decrypt = (encryptedText, key) => {
//   const parts = encryptedText.split(":");
//   const iv = Buffer.from(parts[0], "hex");
//   const encryptedData = parts[1];
//   const akey = getKey(key);

//   const decipher = crypto.createDecipheriv(algorithm, akey, iv);

//   let decrypted = decipher.update(encryptedData, "hex", "utf8");
//   decrypted += decipher.final("utf8");

//   return decrypted;
// };