-- CreateTable
CREATE TABLE `Reporte` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoria` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lng` DOUBLE NOT NULL,
    `ciudad` VARCHAR(191) NOT NULL,
    `imagenUrl` VARCHAR(191) NOT NULL,
    `fechaHora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
