# Upload file

## Import vào postman

**Lưu ý:**: xóa dòng này `"src": "/C:/Users/Dell/Pictures/rxjshop srouce image/Nike Dunk Low Retro/dunk-low-retro-(1)-black.png"`

```json
{
  "info": {
    "_postman_id": "73d6ac4f-e67c-4787-b6a6-f39531ae57ce",
    "name": "Project-01",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "25513351"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "New Request",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        }
      ]
    },
    {
      "name": "Upload",
      "item": [
        {
          "name": "GET",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:3000/api/v1/media/access?key=2ebdcf94-21bc-42f0-a2a9-bc5e6b45cc5b/dunk-low-retro-1-black.png",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "media", "access"],
              "query": [
                {
                  "key": "key",
                  "value": "2ebdcf94-21bc-42f0-a2a9-bc5e6b45cc5b/dunk-low-retro-1-black.png"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Upload",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "formdata",
              "formdata": [
                {
                  "key": "file",
                  "type": "file",
                  "src": "/C:/Users/Dell/Pictures/rxjshop srouce image/Nike Dunk Low Retro/dunk-low-retro-(1)-black.png"
                }
              ]
            },
            "url": {
              "raw": "http://127.0.0.1:3000/api/v1/media/upload",
              "protocol": "http",
              "host": ["127", "0", "0", "1"],
              "port": "3000",
              "path": ["api", "v1", "media", "upload"]
            }
          },
          "response": []
        },
        {
          "name": "Delete",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "http://localhost:3000/api/v1/media/delete?media_id=2ebdcf94-21bc-42f0-a2a9-bc5e6b45cc5b",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "media", "delete"],
              "query": [
                {
                  "key": "media_id",
                  "value": "2ebdcf94-21bc-42f0-a2a9-bc5e6b45cc5b"
                }
              ]
            }
          },
          "response": []
        }
      ]
    }
  ]
}
```
