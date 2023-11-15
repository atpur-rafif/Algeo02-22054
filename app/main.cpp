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

// #define STB_IMAGE_WRITE_IMPLEMENTATION
// #include "lib/stb/stb_image_write.hpp"

int main(int argc, char** argv){
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

    Image *targetImage = new Image(targetPath);
    if(cbirType == "color"){
        Vectors *targetVectors = getHSVFeatureVector(targetImage, BLOCK);

        for(int i = 0; i <= 4000; ++i){
            string path = datasetPath + "/" + to_string(i) + ".jpg";
            Image *testImage = new Image(path);
            Vectors *testVectors = getHSVFeatureVector(testImage, BLOCK);
            double angle = Vectors::getAngleAverage(targetVectors, testVectors);
            if(angle > 0.8){
                printf("%s %lf\n", path.c_str(), angle);
            }
        }

    } else if(cbirType == "texture"){
        Vectors *targetVectors = getTextureFeature(targetImage);

        for(int i = 1; i <= 4000; ++i){
            string path = datasetPath + "/" + to_string(i) + ".jpg";
            Image *testImage = new Image(path);
            Vectors *testVectors = getTextureFeature(testImage);
            double angle = Vectors::getAngleAverage(targetVectors, testVectors);
            if(angle > 0.8){
                printf("%s %lf\n", path.c_str(), angle);
            }
            break;
        }

    } else {
        printf("Invalid CBIR Type: %s", cbirType.c_str());
    }
}