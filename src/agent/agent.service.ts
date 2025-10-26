import {  Injectable } from "@nestjs/common";
import { AgentsRepository } from "../repositories/agent/agent.repository";


@Injectable()

export class AgentService{
    constructor(private readonly agentrepo:AgentsRepository){}
    async agentIdCardExist(id_card_number:string){
        await this.agentrepo.findByIdCardNumber(id_card_number)
    }
}