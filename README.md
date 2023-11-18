## Dekripsi Program
Program ini bernama iCBIR. Program ini adalah program website yang digunakan untuk mencari gambar.
User akan mengirim gambar ke website, lalu program akan menampilkan gambar-gambar yang mirip dengan input user.

## How To Use
1. Buka halaman dataset dan tambahkan folder dataset pada Add New (Folder).
2. Masukkan gambar yang ingin dicari pada halaman home.
3. Pilih metode pencarian (Color atau Texture).
4. Gambar-gambar pada dataset yang memiliki kemiripan >60% dengan gambar input akan ditampilkan secara terurut dari yang tertinggi.
5. Selain menguploud gambar dari device, pengguna juga dapat menggunakan fitur Camera untuk menggunakan tangkapan gambar langsung (live) dari webcam sebagai input gambar.

## Demo  
![Demo](Demo.gif)  

## Using Release
Download file with the same target machine as your computer, then inflate it. To run the program, you must have node.js installed and using `node main.js` command in release root directory (where main.js exist).  

When binary blocked from running in macos machine, use `xattr -d com.apple.quarantine ./bin/main` command to allow it to run.

## Library Used
[nothings/stb](https://github.com/nothings/stb)   
[nlohmann/json](https://github.com/nlohmann/json)  
