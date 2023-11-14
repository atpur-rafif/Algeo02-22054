#include <stdio.h>
#include <string>
#include <iostream>
#include <chrono>
#include <fstream>
#include <filesystem>
#include <set>
#include <vector>
#include <dirent.h>
#include "lib/image.hpp"
#include "lib/vector.hpp"
#include "lib/cbir_color.hpp"
#include "lib/cbir_texture.hpp"

using namespace std;
using namespace std::chrono;
set<string> exts = {".png", ".jpg", ".bmp"};

int main(int argc, char** argv){
    Image *Lena = new Image("./dataset/_.jpg");
    ImageBlocks* blocks = new ImageBlocks(Lena, 3, 3);

    return 0;
    if(argc != 4){
        printf("Usage: %s [CBIR Type] [Dataset Directory Path] [Target Image Path]\n", argv[0]);
        printf("CBIR Type: \"color\" or \"texture\"\n");
        return 0;
    }

    string datasetPath = argv[2];
    DIR *datasetDir = opendir(datasetPath.c_str());

    dirent *tmpDirent;
    vector<string> dataset;
    while((tmpDirent = readdir(datasetDir)) != NULL){
        string filename = tmpDirent->d_name;
        string ext = filename.substr(filename.rfind("."));
        if(exts.count(ext) == 0) continue;
        dataset.push_back(filename);
    }

    string cbirType = argv[1];
    string targetPath = argv[3];

    if(cbirType == "color"){
    } else if(cbirType == "texture"){

    } else {
        printf("Invalid CBIR Type: %s", cbirType.c_str());
    }
}