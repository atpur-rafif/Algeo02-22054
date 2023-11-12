#include <stdio.h>
#include <string>
#include <iostream>
#include <chrono>
#include <fstream>
#include <filesystem>
#include <set>
#include <vector>
#include "lib/image.hpp"
#include "lib/vector.hpp"
#include "lib/histogram.hpp"
#include "lib/cbir_color.hpp"
#include "lib/cbir_texture.hpp"
#include "lib/nlohmann/json.hpp"

using namespace std;
using namespace std::__fs;
using json = nlohmann::json;
using namespace std::chrono;
set<string> exts = {".png", ".jpg", ".bmp"};

int main(){
    ifstream config("./dist/target/texture.json");
    json data = json::parse(config);

    string dataset = data.at("dataset");
    string target = data.at("target");

    string type = data.at("type");

    auto targetImage = new Image(target);
    vector<string> datasetPaths;
    for(const auto &entry : filesystem::directory_iterator(dataset)){
        auto path = entry.path();
        auto ext = path.extension();
        if(exts.count(ext) == 0) continue;
        datasetPaths.push_back(path);
    }

    if(type == string("color")){
        auto bin = data.at("bin");
        vector<double> hBin = bin.at("h");
        vector<double> sBin = bin.at("s");
        vector<double> vBin = bin.at("v");

        auto hHist = new Histogram(hBin);
        auto sHist = new Histogram(sBin);
        auto vHist = new Histogram(vBin);

        for(const auto testPath : datasetPaths){
            auto testImage = new Image(testPath);
            printf("%s %lf\n", testPath.c_str(), getColorAngle(targetImage, testImage, 5));
            delete testImage;
        }
    } else if(type == string("texture")){
        int blockSize = data.at("blockSize");
        int dimension = blockSize * blockSize;

        auto contrastTarget = new Vector(dimension);
        auto homogenityTarget = new Vector(dimension);
        auto entropyTarget = new Vector(dimension);

        for(const auto testPath : datasetPaths){
            auto testImage = new Image(testPath);
            printf("%s", testPath.c_str());
            break;
        }
    }
}