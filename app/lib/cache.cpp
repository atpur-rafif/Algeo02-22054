#include <string>
#include <fstream>
#include "nlohmann/json.hpp"
#include "cache.hpp"

using json = nlohmann::json;
static json cache = NULL;
string cachePath;

void cacheSetup(string path, string type){
    if(cache != NULL) return;

    if(type == "color"){
        cachePath = path + "/" + "__cache_color__.json";
    } else if(type == "texture"){
        cachePath = path + "/" + "__cache_texture__.json";
    }

    bool fail = false;

    ifstream ifs(cachePath);
    if(ifs.fail()){
        fail = true;
    }

    if(!fail){
        try{
            cache = json::parse(ifs);
        } catch(json::parse_error& ex){
            fail = true;
        };
    }

    ifs.close();
    if(fail){
        cache = json({});
    }
}

void addCache(string filename, Vectors* vs){
    json vsj = json::array();

    for(int i = 0; i < vs->size; ++i){
        Vector *v = vs->vectors[i];
        json vj = json::array();
        for(int j = 0; j < v->dimension; ++j){
            vj.push_back(v->component[j]);
        }
        vsj.push_back(vj);
    }

    cache[filename] = vsj;
}

void cacheCleanup(){
    ofstream ofs(cachePath);
    ofs << cache.dump() << endl;
}

Vectors *getCache(string filename){
    if(!cache.contains(filename)) return NULL;

    auto jvs = cache.at(filename);
    int jvsSize = jvs.size();

    Vectors *vs = new Vectors(jvsSize);
    for(int i = 0; i < jvsSize; ++i){
        vector<double> jv = jvs.at(i);
        int jvSize = jv.size();

        Vector *v = new Vector(jvSize);
        for(int j = 0; j < jvSize; ++j){
            v->component[j] = jv.at(j);
        }
        vs->vectors[i] = v;
    }

    return vs;
}
