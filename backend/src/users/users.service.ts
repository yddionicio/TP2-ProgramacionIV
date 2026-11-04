import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  create(data: Partial<User>) {
    return this.model.create(data);
  }

  findByCorreoOUsuario(correo: string, nombreUsuario: string) {
    return this.model.findOne({
      $or: [{ correo: correo.toLowerCase() }, { nombreUsuario }],
    });
  }

  findByIdentificador(identificador: string) {
    return this.model.findOne({
      $or: [{ correo: identificador.toLowerCase() }, { nombreUsuario: identificador }],
    });
  }
}