-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "user_name" TEXT NOT NULL,
    "pass_word" TEXT NOT NULL,
    "is_librian" BOOLEAN NOT NULL DEFAULT false,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "majors" (
    "id_major" SERIAL NOT NULL,
    "major_name" TEXT NOT NULL,

    CONSTRAINT "majors_pkey" PRIMARY KEY ("id_major")
);

-- CreateTable
CREATE TABLE "jobs_titles" (
    "id_job_title" SERIAL NOT NULL,
    "job_title_name" TEXT NOT NULL,

    CONSTRAINT "jobs_titles_pkey" PRIMARY KEY ("id_job_title")
);

-- CreateTable
CREATE TABLE "readers" (
    "id_reader" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "phone_number" TEXT,
    "gender" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "id_job_title" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_major" INTEGER NOT NULL,

    CONSTRAINT "readers_pkey" PRIMARY KEY ("id_reader")
);

-- CreateTable
CREATE TABLE "categories" (
    "id_category" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id_category")
);

-- CreateTable
CREATE TABLE "authors" (
    "id_author" SERIAL NOT NULL,
    "author_name" TEXT NOT NULL,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id_author")
);

-- CreateTable
CREATE TABLE "publishers" (
    "id_publisher" SERIAL NOT NULL,
    "publisher_name" TEXT NOT NULL,

    CONSTRAINT "publishers_pkey" PRIMARY KEY ("id_publisher")
);

-- CreateTable
CREATE TABLE "documents" (
    "id_document" SERIAL NOT NULL,
    "document_name" TEXT NOT NULL,
    "published_year" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "id_major" INTEGER NOT NULL,
    "id_author" INTEGER NOT NULL,
    "id_publisher" INTEGER NOT NULL,
    "id_category" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id_document")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id_supplier" SERIAL NOT NULL,
    "supplier_name" INTEGER NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id_supplier")
);

-- CreateTable
CREATE TABLE "document_puchases" (
    "id_purchase" SERIAL NOT NULL,
    "id_document" INTEGER NOT NULL,
    "id_supplier" INTEGER NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "document_puchases_pkey" PRIMARY KEY ("id_purchase")
);

-- CreateTable
CREATE TABLE "loan_requests" (
    "id_loan_request" SERIAL NOT NULL,
    "id_document" INTEGER NOT NULL,
    "loan_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_requests_pkey" PRIMARY KEY ("id_loan_request")
);

-- CreateTable
CREATE TABLE "loan_request_list_documents" (
    "id" SERIAL NOT NULL,
    "id_loan_request" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "id_document" INTEGER NOT NULL,

    CONSTRAINT "loan_request_list_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "punishments" (
    "id_punish" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "is_handled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "punishments_pkey" PRIMARY KEY ("id_punish")
);

-- CreateTable
CREATE TABLE "loan_return_transactions" (
    "id_loan_return" SERIAL NOT NULL,
    "id_loan_request" INTEGER NOT NULL,
    "id_reader" INTEGER NOT NULL,
    "id_document" INTEGER NOT NULL,
    "id_punish" INTEGER,
    "return_date" TIMESTAMP(3) NOT NULL,
    "return_status" TEXT NOT NULL,

    CONSTRAINT "loan_return_transactions_pkey" PRIMARY KEY ("id_loan_return")
);

-- CreateTable
CREATE TABLE "marked_documents" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_document" INTEGER NOT NULL,

    CONSTRAINT "marked_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "readers_id_user_key" ON "readers"("id_user");

-- AddForeignKey
ALTER TABLE "readers" ADD CONSTRAINT "readers_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readers" ADD CONSTRAINT "readers_id_job_title_fkey" FOREIGN KEY ("id_job_title") REFERENCES "jobs_titles"("id_job_title") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readers" ADD CONSTRAINT "readers_id_major_fkey" FOREIGN KEY ("id_major") REFERENCES "majors"("id_major") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_id_major_fkey" FOREIGN KEY ("id_major") REFERENCES "majors"("id_major") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_id_author_fkey" FOREIGN KEY ("id_author") REFERENCES "authors"("id_author") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_id_publisher_fkey" FOREIGN KEY ("id_publisher") REFERENCES "publishers"("id_publisher") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_id_category_fkey" FOREIGN KEY ("id_category") REFERENCES "categories"("id_category") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_puchases" ADD CONSTRAINT "document_puchases_id_supplier_fkey" FOREIGN KEY ("id_supplier") REFERENCES "suppliers"("id_supplier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_puchases" ADD CONSTRAINT "document_puchases_id_document_fkey" FOREIGN KEY ("id_document") REFERENCES "documents"("id_document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_request_list_documents" ADD CONSTRAINT "loan_request_list_documents_id_document_fkey" FOREIGN KEY ("id_document") REFERENCES "documents"("id_document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_return_transactions" ADD CONSTRAINT "loan_return_transactions_id_document_fkey" FOREIGN KEY ("id_document") REFERENCES "documents"("id_document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_return_transactions" ADD CONSTRAINT "loan_return_transactions_id_punish_fkey" FOREIGN KEY ("id_punish") REFERENCES "punishments"("id_punish") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_return_transactions" ADD CONSTRAINT "loan_return_transactions_id_reader_fkey" FOREIGN KEY ("id_reader") REFERENCES "readers"("id_reader") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_return_transactions" ADD CONSTRAINT "loan_return_transactions_id_loan_request_fkey" FOREIGN KEY ("id_loan_request") REFERENCES "loan_requests"("id_loan_request") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marked_documents" ADD CONSTRAINT "marked_documents_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
