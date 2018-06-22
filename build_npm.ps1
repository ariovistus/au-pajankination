#rm -recurse -force dist/*
mkdir -force dist/combobox/bootstrap
mkdir -force dist/grid/bootstrap
cp src/combobox/bootstrap/*.css dist/combobox/bootstrap
cp src/combobox/bootstrap/*.html dist/combobox/bootstrap
cp src/grid/bootstrap/*.css dist/grid/bootstrap
cp src/grid/bootstrap/*.html dist/grid/bootstrap
docker run -v "$(pwd):/app" --entrypoint yarn sandrokeil/typescript install
docker run -v "$(pwd):/app" --entrypoint python sandrokeil/typescript versionchecker.py
docker run -v "$(pwd):/app" --entrypoint tsc sandrokeil/typescript -p . --outDir dist
docker run -v "$(pwd):/app" --entrypoint sh sandrokeil/typescript build_tsdecls_only.sh 
docker run -v "$(pwd):/app" --entrypoint npm sandrokeil/typescript pack

