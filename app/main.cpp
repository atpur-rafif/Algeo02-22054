#include <stdio.h>
#include <string>
#include <chrono>
#include <set>
#include <vector>
#include <dirent.h>
#include "lib/image.hpp"
#include "lib/vector.hpp"
#include "lib/cbir_color.hpp"
#include "lib/cbir_texture.hpp"
#include "lib/cache.hpp"

using namespace std;
set<string> exts = {".png", ".jpg", ".bmp"};

int main(int argc, char** argv){
    if(!(argc == 3 || argc == 4)){
        printf("Usage: %s [CBIR Type] [Dataset Directory Path] [Target Image Path]\n", argv[0]);
        printf("CBIR Type: \"color\" or \"texture\"\n");
        printf("Empty target for caching purpose only\n");
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

    bool hasTarget = argc == 4;
    string cbirType = argv[1];
    string targetPath = hasTarget ? argv[3] : "";
    cacheSetup(datasetPath, cbirType);

    Vectors* (*vectorsFn) (Image*) = NULL;
    if(cbirType == "color") vectorsFn = getHSVFeatureVector;
    else if(cbirType == "texture") vectorsFn = getTextureFeature;

    Image *targetImage;
    Vectors *targetVectors;
    if(hasTarget){
        targetImage = new Image(targetPath);
        targetVectors = vectorsFn(targetImage);
    }

    for (const auto filename : dataset){
        string path = datasetPath + "/" + filename;
        Vectors *testVectors = getCache(filename);
        bool cacheMiss = testVectors == NULL;

        if (cacheMiss){
            Image *testImage = new Image(path);
            testVectors = vectorsFn(testImage);
            addCache(filename, testVectors);
            delete testImage;
        }

        if(hasTarget){
            double angle = Vectors::getAngleAverage(targetVectors, testVectors);
            if (angle > 0.6){
                printf("%s %lf\n", path.c_str(), angle);
            }
        } else {
            if(cacheMiss) printf("Cached %s\n", filename.c_str());
            else printf("Cache hit\n");
        }

        delete testVectors;
    }
    cacheCleanup();
}