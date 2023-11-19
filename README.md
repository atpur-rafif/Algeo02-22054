## Dekripsi Program
Program ini bernama iCBIR. Program ini adalah program website yang digunakan untuk mencari gambar.  
User akan mengirim gambar ke website, lalu program akan menampilkan gambar-gambar yang mirip dengan input user.  
Folder `src` diubah menjadi `web` dan `app` untuk mengurangi nested folder.  

## How To Use
1. Buka halaman dataset dan tambahkan folder dataset pada Add New (Folder).
2. Masukkan gambar yang ingin dicari pada halaman home.
3. Pilih metode pencarian (Color atau Texture).
4. Gambar-gambar pada dataset yang memiliki kemiripan >60% dengan gambar input akan ditampilkan secara terurut dari yang tertinggi.
5. Selain menguploud gambar dari device, pengguna juga dapat menggunakan fitur Camera untuk menggunakan tangkapan gambar langsung (live) dari webcam sebagai input gambar.

## Demo  
![Demo](Demo.gif)  

## Using Release
1. Download web.zip and binary with the same target machine as your computer (see: target machine)
2. Inflate/extract web.zip  
3. Create folder `bin` in inflated/extracted folder  
4. Move binary file to `bin` then rename it to `main` (for windows use `main.exe`)  
5. Go back to the root of inflated folder  
6. Run `node main.js` to start the program  

### Target machine
- Windows: x86_64-w64-mingw32 (Unstable, compiled with [w64devkit](https://github.com/skeeto/w64devkit))  
- Linux64: x86_64-linux-gnu  
- Apple Silicon: arm64-apple-darwin  

## Build From Source
Make sure you have already installed: `nodejs`, `npm`, `make`, `g++`
1. Clone this repo
2. Install dependencies with `npm i`
3. Build binary with `make build`
4. Build website with `npm run build-web`
5. To serve, use command `npm run serve`

## Library Used
[nothings/stb](https://github.com/nothings/stb)   
[nlohmann/json](https://github.com/nlohmann/json)  
