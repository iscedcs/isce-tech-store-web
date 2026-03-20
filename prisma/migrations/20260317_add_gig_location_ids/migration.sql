-- Add GIG location IDs to ShippingInfo
ALTER TABLE "ShippingInfo" ADD COLUMN "stationId" INTEGER,
ADD COLUMN "areaId" TEXT;
