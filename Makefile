.PHONY: build
build:
	mkdir -p build/js && npm install && npm run build && cp manifest.json build && rsync -rtL node_modules/mathjax build/js

.PHONY: clean
clean:
	rm -rf build
