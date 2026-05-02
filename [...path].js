{
  "version": 2,
  "public": true,
  "routes": [
    { "src": "/scramjet/(.*)", "dest": "/api/pkg/scramjet/$1" },
    { "src": "/controller/(.*)", "dest": "/api/pkg/controller/$1" },
    { "src": "/libcurl/(.*)",  "dest": "/api/pkg/libcurl/$1"  },
    { "src": "/baremux/(.*)",  "dest": "/api/pkg/baremux/$1"  },
    { "src": "/epoxy/(.*)",    "dest": "/api/pkg/epoxy/$1"    },
    { "src": "/api/(.*)",      "dest": "/api/$1"              },
    { "src": "/(.*)",          "dest": "/public/$1"           }
  ]
}
