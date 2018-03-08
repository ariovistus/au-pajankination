rm -recurse -force dist/*
mkdir -p dist -force
mkdir -p dist/grid -force
cp src/select2.css dist
cp src/grid/grid.css dist/grid
cp src/*.html dist
cp src/grid/*.html dist/grid
docker run -v "$(pwd):/app" --entrypoint yarn sandrokeil/typescript install
docker run -v "$(pwd):/app" --entrypoint python sandrokeil/typescript versionchecker.py
docker run -v "$(pwd):/app" --entrypoint tsc sandrokeil/typescript -p . --outDir dist
docker run -v "$(pwd):/app" --entrypoint sh sandrokeil/typescript build_tsdecls_only.sh 
docker run -v "$(pwd):/app" --entrypoint npm sandrokeil/typescript pack

