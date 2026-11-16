#!/bin/sh
# kaynak.html -> index.html (tek başına çalışan sayfa + Google girişi için cloud.js)
cd "$(dirname "$0")" || exit 1
{
  printf '<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>\n'
  cat kaynak.html
  printf '<script type="module" src="cloud.js?v=%s"></script>\n</body></html>\n' "$(date +%s)"
} > index.html
echo "index.html hazır"
