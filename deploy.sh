#!/bin/bash

# Este script fará o build do projeto Vite e enviará os arquivos para um bucket público no OCI.
# Pré-requisitos: 
# - Você precisa estar autenticado no OCI CLI (`oci setup config` ou via Cloud Shell).
# - Certifique-se de substituir o valor de COMPARTMENT_OCID abaixo pelo seu verdadeiro OCID.

# Defina as variáveis abaixo
BUCKET_NAME="pixie-frontend-bucket"
COMPARTMENT_OCID="ocid1.compartment.oc1..aaaaaaaaw4ma7w3rc5evjxgq272jodif7e7gizuoftq44uwgv4s4pkmtywqa"

echo "====================================="
echo "Iniciando processo de deploy da Pixie"
echo "====================================="

echo "1. Rodando o build de produção (npm run build)..."
VITE_API_BASE_URL="https://gucoziy7jn4ikqrjcfur5nds4e.apigateway.sa-saopaulo-1.oci.customer-oci.com" npm run build
if [ $? -ne 0 ]; then
    echo "Erro: O build falhou. Abortando deploy."
    exit 1
fi

echo "2. Criando o bucket público ($BUCKET_NAME) no OCI..."
oci os bucket create \
  --name "$BUCKET_NAME" \
  --compartment-id "$COMPARTMENT_OCID" \
  --public-access-type ObjectReadWithoutList \
  --region sa-saopaulo-1

# O comando de create pode falhar se o bucket já existir, mas podemos continuar mesmo assim.
# Se quiser ignorar erros caso já exista, deixamos seguir.

echo "3. Fazendo upload dos arquivos gerados para o Object Storage..."
oci os object bulk-upload \
  -bn "$BUCKET_NAME" \
  --src-dir ./dist \
  --content-type auto \
  --overwrite \
  --region sa-saopaulo-1

echo "====================================="
echo "Deploy finalizado com sucesso!"
echo "Acesse seu frontend pela URL (substitua o namespace):"
echo "https://objectstorage.sa-saopaulo-1.oraclecloud.com/n/<seu-namespace>/b/$BUCKET_NAME/o/index.html"
echo "====================================="
