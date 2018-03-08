rm -rf dist/*
mkdir -p dist/grid
cp src/select2.css dist
cp src/grid/grid.css dist/grid
cp src/*.html dist
cp src/grid/*.html dist/grid
docker run -v "$(pwd):/app:z" --entrypoint yarn sandrokeil/typescript install
docker run -v "$(pwd):/app:z" --entrypoint python sandrokeil/typescript versionchecker.py
docker run -v "$(pwd):/app:z" --entrypoint tsc sandrokeil/typescript -d -p . --outDir dist
docker run -v "$(pwd):/app:z" --entrypoint sh sandrokeil/typescript build_tsdecls_only.sh 
docker run -v "$(pwd):/app:z" --entrypoint npm sandrokeil/typescript pack
