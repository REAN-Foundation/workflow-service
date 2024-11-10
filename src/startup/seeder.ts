import fs from "fs";
import path from "path";
import { logger } from "../logger/logger";
import * as RolePrivilegesList from '../../seed.data/role.privileges.json';
import * as howToEarnBadgeContent from '../../seed.data/how.to.earn.badge.content.seed.json';
import { UserService } from '../database/services/user/user.service';
import { UserCreateModel } from "../domain.types/user/user.domain.types";
import { Gender } from "../domain.types/miscellaneous/system.types";
import { RoleService } from "../database/services/user/role.service";
import { FileResourceService } from "../database/services/general/file.resource.service";
import { PrivilegeService } from "../database/services/user/privilege.service";
import { RoleCreateModel } from "../domain.types/user/role.domain.types";
import { ClientResponseDto } from "../domain.types/client/client.domain.types";
import { FileUtils } from "../common/utilities/file.utils";
import { StringUtils } from "../common/utilities/string.utils";
import { BadgeStockImageDomainModel } from "../domain.types/badge.stock.image/badge.stock.image.domain.model";
import { BadgeStockImageService } from "../database/services/badge.stock.images/badge.stock.image.service";
import { ClientService } from "../database/services/client/client.service";
import { BadgeService } from "../database/services/awards/badge.service";
import { BadgeUpdateModel } from "../domain.types/awards/badge.domain.types";
import { Injector } from "./injector";

//////////////////////////////////////////////////////////////////////////////

export class Seeder {
    public static seed = async (): Promise<void> => {
        try {
            await createTempFolders();
            await seedDefaultRoles();
            await seedInternalClients();
            await seedRolePrivileges();
            await seedDefaultUsers();
            await seedBadgeStockImages();
            await seedHowToEarnBadgeContent();
        } catch (error) {
            logger.error(error.message);
        }
    };
}

//////////////////////////////////////////////////////////////////////////////

const createTempFolders = async () => {
    await FileUtils.createTempDownloadFolder();
    await FileUtils.createTempUploadFolder();
};

const seedRolePrivileges = async () => {
    try {
        const roleService: RoleService = new RoleService();
        const privilegeService: PrivilegeService = new PrivilegeService();

        const arr = RolePrivilegesList['default'];
        for (let i = 0; i < arr.length; i++) {
            const rp = arr[i];
            const roleName = rp['Role'];
            const privileges = rp['Privileges'];

            const role = await roleService.getByRoleName(roleName);
            if (role == null) {
                continue;
            }
            for (const privilege of privileges) {
                var privilegeDto = await privilegeService.getByPrivilegeName(privilege);
                if (!privilegeDto) {
                    privilegeDto = await privilegeService.create({
                        Name: privilege,
                    });
                }
                await privilegeService.addToRole(privilegeDto.id, role.id);
            }
        }
    } catch (error) {
        logger.info('Error occurred while seeding role-privileges!');
    }
    logger.info('Seeded role-privileges successfully!');
};

const seedDefaultUsers = async () => {
    const roleService: RoleService = new RoleService();
    const userService: UserService = new UserService();
    const clientService: ClientService = new ClientService();

    const results = await clientService.search({ Name: 'Internal' });
    if (results.Items.length === 0) {
        throw new Error('Error while seeding: Internal client not found!');
    }
    const internalClient = results.Items[0];
    const internalClientId = internalClient.id;

    const defaultUsers = loadJSONSeedFile('default.users.seed.json');

    for await (var u of defaultUsers) {
        const role = await roleService.getByRoleName(u.Role);

        const existingUser = await userService.getUser(null, null, null, u.UserName);
        if (existingUser) {
            continue;
        }

        const createModel: UserCreateModel = {
            ClientId: internalClientId,
            Phone: u.Phone,
            FirstName: u.FirstName,
            LastName: u.LastName,
            UserName: u.UserName,
            Password: u.Password,
            RoleId: role.id,
            CountryCode: u.CountryCode,
            Email: u.Email,
            Gender: Gender.Male,
            BirthDate: null,
            Prefix: '',
        };

        createModel.Password = StringUtils.generateHashedPassword(u.Password);
        const user = await userService.create(createModel);
        logger.info(JSON.stringify(user, null, 2));
    }

    logger.info('Seeded default users successfully!');
};

const seedInternalClients = async () => {

    const clientService: ClientService = new ClientService();
    logger.info('Seeding internal clients...');
    const clients: ClientResponseDto[] = [];
    const arr = loadJSONSeedFile('internal.clients.seed.json');

    for (let i = 0; i < arr.length; i++) {
        var c = arr[i];
        let client = await clientService.getByClientCode(c.Code);
        if (client == null) {
            const model = {
                Name: c['Name'],
                Code: c['Code'],
                IsPrivileged: c['IsPrivileged'],
                CountryCode: '+91',
                Phone: '1000000000',
                Email: c['Email'],
                Password: c['Password'],
                ValidFrom: new Date(),
                ValidTill: new Date(2030, 12, 31),
                ApiKey: c['ApiKey'],
            };
            client = await clientService.create(model);
            logger.info(JSON.stringify(client, null, 2));
        }
        clients.push(client);
    }
    return clients;
};

const seedDefaultRoles = async () => {
    const roleService: RoleService = new RoleService();
    const defaultRoles = [
        {
            Name: 'Admin',
            Description: 'Administrator of the Awards service',
        },
        {
            Name: 'ContentModerator',
            Description: 'The content moderator representing a particular client.',
        },
    ];
    for await (var role of defaultRoles) {
        var existing = await roleService.getByRoleName(role.Name);
        if (!existing) {
            const model: RoleCreateModel = {
                ...role,
            };
            await roleService.create(model);
        }
    }
    logger.info('Seeded default roles successfully!');
};

const seedBadgeStockImages = async () => {
    const fileResourceService: FileResourceService = Injector.Container.resolve(FileResourceService);
    const badgeStockImageService: BadgeStockImageService = new BadgeStockImageService();

    var images = await badgeStockImageService.getAll();
    if (images.length > 0) {
        return;
    }

    var destinationStoragePath = 'assets/images/stock.badge.images/';
    var sourceFilePath = path.join(process.cwd(), './assets/images/stock.badge.images/');

    var files = fs.readdirSync(sourceFilePath);
    var imageFiles = files.filter((f) => {
        return path.extname(f).toLowerCase() === '.png';
    });

    for await (const fileName of imageFiles) {
        var sourceLocation = path.join(sourceFilePath, fileName);
        var storageKey = destinationStoragePath + fileName;

        var uploaded = await fileResourceService.uploadLocal(storageKey, sourceLocation, true);

        if (!uploaded) {
            continue;
        }

        var domainModel: BadgeStockImageDomainModel = {
            Code: fileName.replace('.png', ''),
            FileName: fileName,
            ResourceId: uploaded.id,
            PublicUrl: uploaded.DefaultVersion.Url,
        };

        var badgeStockImage = await badgeStockImageService.create(domainModel);
        if (!badgeStockImage) {
            logger.info('Error occurred while seeding badge stock images!');
        }
    }
};

const seedHowToEarnBadgeContent = async () => {
    const badgeService: BadgeService = new BadgeService();
    logger.info('Seeding how to earn content for badges...');
    const arr = howToEarnBadgeContent['default'];
    //console.log(JSON.stringify(arr, null, 2));
    for (let i = 0; i < arr.length; i++) {
        const filters = {
            Name: arr[i]['Name'],
        };
        const existingRecord = await badgeService.search(filters);
        //console.log(JSON.stringify(existingRecord, null, 2));
        if (existingRecord.Items.length > 0) {
            const entity = existingRecord.Items[0];
            const model: BadgeUpdateModel = {
                HowToEarn: arr[i]['HowToEarn'],
                ClientId: entity.Client.id,
                CategoryId: entity.Category.id,
            };
            var record = await badgeService.update(entity.id, model);
            var str = JSON.stringify(record, null, '  ');
            logger.info(str);
        }
    }
};

const loadJSONSeedFile = (file: string): any => {
    var filepath = path.join(process.cwd(), 'seed.data', file);
    var fileBuffer = fs.readFileSync(filepath, 'utf8');
    const obj = JSON.parse(fileBuffer);
    return obj;
};

//////////////////////////////////////////////////////////////////////////////
