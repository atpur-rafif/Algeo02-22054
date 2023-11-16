#include <stdio.h>
#include <string>
#include <chrono>
#include <thread>
#include <set>
#include <vector>
#include <dirent.h>
#include "lib/image.hpp"
#include "lib/vector.hpp"
#include "lib/cbir_color.hpp"
#include "lib/cbir_texture.hpp"
#include "lib/cache.hpp"

using namespace std;
set<string> exts = {"png", "jpg", "jpeg", "bmp"};

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
        string ext = filename.substr(filename.rfind(".") + 1);
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

    int count = 0; int tillCount = dataset.size();
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

        ++count;
        if(hasTarget){
            double angle = Vectors::getAngleAverage(targetVectors, testVectors);
            printf("(%d/%d) %s: %lf\n", count, tillCount,  filename.c_str(), angle);
        } else {
            string msg = "hit";
            if(cacheMiss) msg = "miss";
            printf("(%d/%d) Cache %s (%s)\n", count, tillCount,  msg.c_str(), filename.c_str());
        }
        fflush(stdout);

        delete testVectors;
    }
    cacheCleanup();
}