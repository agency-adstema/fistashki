-- CreateEnum
CREATE TYPE "KeywordIntent" AS ENUM ('MONEY', 'PROBLEM', 'GUIDE', 'QUICK', 'PROGRAMMATIC');

-- CreateEnum
CREATE TYPE "SeoKeywordStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "targetKeyword" TEXT,
ADD COLUMN "keywordIntent" "KeywordIntent",
ADD COLUMN "seoScore" INTEGER,
ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "productClickCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "promptVersionId" TEXT,
ADD COLUMN "lastGenerationError" TEXT,
ADD COLUMN "faq" JSONB,
ADD COLUMN "internalLinks" JSONB,
ADD COLUMN "recommendedProductIds" JSONB;

-- CreateTable
CREATE TABLE "seo_keywords" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "intent" "KeywordIntent",
    "status" "SeoKeywordStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "blogPostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_prompt_versions" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "userTemplate" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_prompt_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_generation_logs" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT,
    "keywordRef" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_generation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seo_keywords_keyword_key" ON "seo_keywords"("keyword");

-- CreateIndex
CREATE INDEX "seo_keywords_status_idx" ON "seo_keywords"("status");

-- CreateIndex
CREATE INDEX "seo_keywords_blogPostId_idx" ON "seo_keywords"("blogPostId");

-- CreateIndex
CREATE INDEX "seo_prompt_versions_isActive_idx" ON "seo_prompt_versions"("isActive");

-- CreateIndex
CREATE INDEX "seo_generation_logs_status_idx" ON "seo_generation_logs"("status");

-- CreateIndex
CREATE INDEX "seo_generation_logs_createdAt_idx" ON "seo_generation_logs"("createdAt");

-- CreateIndex
CREATE INDEX "blog_posts_archived_idx" ON "blog_posts"("archived");

-- CreateIndex
CREATE INDEX "blog_posts_aiGenerated_idx" ON "blog_posts"("aiGenerated");

-- CreateIndex
CREATE INDEX "blog_posts_targetKeyword_idx" ON "blog_posts"("targetKeyword");

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_promptVersionId_fkey" FOREIGN KEY ("promptVersionId") REFERENCES "seo_prompt_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_keywords" ADD CONSTRAINT "seo_keywords_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "blog_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
