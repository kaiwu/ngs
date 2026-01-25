.PHONY: clean all

all: nginx

libquickjs.a:
	cd submodules/quickjs && CFLAGS='-fPIC' make libquickjs.a

nginx: libquickjs.a
	cd submodules/nginx && ./auto/configure \
		--with-http_ssl_module \
		--with-http_v2_module \
		--with-http_v3_module \
		--with-stream \
		--add-module=../njs/nginx \
		--with-cc-opt="-I ../quickjs" \
		--with-ld-opt="-L ../quickjs" \
		--with-debug && make

clean:
	rm -rf dist/nginx submodules/njs/libquickjs.a submodules/nginx/objs
