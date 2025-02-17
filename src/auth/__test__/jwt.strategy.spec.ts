import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../jwt.strategy';
import { UserRepository } from '../user.repository';
import { User } from '../user.entity';
import * as config from 'config';


config.get = jest.fn();

const mockUserRepository = () => ({
    findOne: jest.fn(),
});


process.env.JWT_SECRET = 'someJwtSecretForTesting';

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;
    let userRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                { provide: UserRepository, useFactory: mockUserRepository },
            ],
        }).compile();

        jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
        userRepository = await module.get<UserRepository>(UserRepository);
    });

    describe('validate', () => {
        it('validates and returns the user based on JWT payload', async () => {
            const user = new User();
            user.username = 'TestUser';

            userRepository.findOne.mockResolvedValue(user);
            const result = await jwtStrategy.validate({ username: 'TestUser' });
            expect(userRepository.findOne).toHaveBeenCalledWith({ username: 'TestUser' });
            expect(result).toEqual(user);
        });

    });
    it('throws an unauthorized exception as user cannot be found', () => {
        userRepository.findOne.mockResolvedValue(null);
        expect(jwtStrategy.validate({ username: 'TestUser' })).rejects.toThrow(UnauthorizedException);
    });




});

