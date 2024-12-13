-- CreateEnum
CREATE TYPE "AIEntityStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'BETA', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('ASSISTANT', 'AGENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_entities" (
    "id" TEXT NOT NULL,
    "type" "EntityType" NOT NULL,
    "icon" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "AIEntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "statusMessage" TEXT,
    "order" INTEGER,
    "initial_prompt" TEXT NOT NULL,
    "guidance" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_configurations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_configurations_userId_entityId_key" ON "user_configurations"("userId", "entityId");

-- AddForeignKey
ALTER TABLE "user_configurations" ADD CONSTRAINT "user_configurations_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "ai_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_configurations" ADD CONSTRAINT "user_configurations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
