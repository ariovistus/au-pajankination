rm -recurse -force dist/*
mkdir -p dist -force
cp src/select2.css dist
cp src/*.html dist
docker run -v "$(pwd):/app" --entrypoint yarn sandrokeil/typescript install
docker run -v "$(pwd):/app" --entrypoint python sandrokeil/typescript versionchecker.py
docker run -v "$(pwd):/app" --entrypoint tsc sandrokeil/typescript -p . --outDir dist
docker run -v "$(pwd):/app" --entrypoint tsc sandrokeil/typescript -d -p . --outDir . --noEmit
docker run -v "$(pwd):/app" --entrypoint npm sandrokeil/typescript pack

