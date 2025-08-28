import json

# Lee el archivo JSONL
with open('openfoodfacts-products.jsonl', 'r', encoding='utf-8') as file:
    lines = file.readlines()

# Convierte cada línea a un objeto JSON y crea una lista
data = [json.loads(line.strip()) for line in lines if line.strip()]

# Guarda como JSON
with open('openfoodfacts_products.json', 'w', encoding='utf-8') as outfile:
    json.dump(data, outfile, ensure_ascii=False, indent=2)

print("Conversion completed. Saved as openfoodfacts_products.json")