CC = g++
CFLAGS = -std=c++20 -O2

OUT = main
OUT_PATH = $(OUT_DIR)/$(OUT)

SRC_DIR = app
OUT_DIR = dist/bin
OBJ_DIR = $(OUT_DIR)/o

DEPS = main.cpp lib/image.cpp lib/vector.cpp lib/cbir_color.cpp

PREPEND_ALL = $(foreach f,$2,$1$f)
DEPS_SRC = $(call PREPEND_ALL,$(SRC_DIR)/,$(DEPS))
DEPS_OBJ = $(patsubst %.cpp,%.o,$(call PREPEND_ALL,$(OBJ_DIR)/,$(DEPS)))

$(OBJ_DIR)/%.o: $(SRC_DIR)/%.cpp
	mkdir -p $(@D)
	$(CC) $(CFLAGS) -c -o $@ $^

$(OUT_PATH) : $(DEPS_OBJ)
	$(CC) $(CFLAGS) -o $(OUT_DIR)/$(OUT) $^


build: $(OUT_PATH)

clean:
	rm -rf $(OUT_DIR)

all: $(OUT_PATH)
	$(OUT_DIR)/main