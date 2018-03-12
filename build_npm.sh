docker run -v "$(pwd):/app:z" --entrypoint sh sandrokeil/typescript rebuild_dist.sh
docker run -v "$(pwd):/app:z" --entrypoint yarn sandrokeil/typescript install
docker run -v "$(pwd):/app:z" --entrypoint python sandrokeil/typescript versionchecker.py
docker run -v "$(pwd):/app:z" --entrypoint tsc sandrokeil/typescript -d -p . --outDir dist
docker run -v "$(pwd):/app:z" --entrypoint sh sandrokeil/typescript build_tsdecls_only.sh 
docker run -v "$(pwd):/app:z" --entrypoint npm sandrokeil/typescript pack
