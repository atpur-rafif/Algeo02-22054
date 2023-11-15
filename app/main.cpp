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
    cacheSetup(datasetPath, cbirType);

    Image *targetImage = new Image(targetPath);
    if(cbirType == "color"){
        Vectors *targetVectors = getHSVFeatureVector(targetImage, BLOCK);

        for(const auto filename : dataset){
            string path = datasetPath + "/" + filename;
            Vectors *testVectors = getCache(filename);

            if(!testVectors){
                Image *testImage = new Image(path);
                testVectors = getHSVFeatureVector(testImage, BLOCK);
                addCache(filename, testVectors);
                delete testImage;
            }
            
            double angle = Vectors::getAngleAverage(targetVectors, testVectors);
            if(angle > 0.6){
                printf("%s %lf\n", path.c_str(), angle);
            }

            delete testVectors;
        }
    } else if(cbirType == "texture"){
        Vectors *targetVectors = getTextureFeature(targetImage);

        for(const auto filename : dataset){
            string path = datasetPath + "/" + filename;
            Vectors *testVectors = getCache(filename);

            if (!testVectors){
                Image *testImage = new Image(path);
                testVectors = getTextureFeature(testImage);
                addCache(filename, testVectors);
                delete testImage;
            }

            double angle = Vectors::getAngleAverage(targetVectors, testVectors);
            if (angle > 0.6){
                printf("%s %lf\n", path.c_str(), angle);
            }

            delete testVectors;
        }

    } else {
        printf("Invalid CBIR Type: %s", cbirType.c_str());
    }

    cacheCleanup();
}