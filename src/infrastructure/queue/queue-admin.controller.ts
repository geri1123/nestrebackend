// import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
// import { InjectQueue } from '@nestjs/bullmq';
// import { Queue } from 'bullmq';
// import { QUEUES } from '../../infrastructure/queue/constants/queue-names.constant';
// import { Public } from '../../common/decorators/public.decorator';
// @Public()
// @Controller('admin/queues')
// export class QueueAdminController {
//   constructor(
//     @InjectQueue(QUEUES.EMAIL) private readonly emailQueue: Queue,
//     @InjectQueue(QUEUES.CLEANUP) private readonly cleanupQueue: Queue,
//     @InjectQueue(QUEUES.PRODUCT_COUNTS) private readonly productCountsQueue: Queue,
//   ) {}

//   // Fshin vetëm jobs që presin (waiting/delayed)
//   @Delete(':queue/drain')
//   async drain(@Param('queue') queue: string) {
//     const q = this.getQueue(queue);
//     await q.drain();
//     return { success: true, message: `Queue ${queue} drained` };
//   }

//   // Fshin GJITHÇKA (waiting, active, completed, failed, delayed)
//   @Delete(':queue/obliterate')
//   async obliterate(@Param('queue') queue: string) {
//     const q = this.getQueue(queue);
//     await q.obliterate({ force: true });
//     return { success: true, message: `Queue ${queue} obliterated` };
//   }

//   // Fshin vetëm failed jobs
//   @Delete(':queue/failed')
//   async cleanFailed(@Param('queue') queue: string) {
//     const q = this.getQueue(queue);
//     await q.clean(0, 100, 'failed');
//     return { success: true, message: `Failed jobs cleaned from ${queue}` };
//   }

//   // Fshin vetëm completed jobs
//   @Delete(':queue/completed')
//   async cleanCompleted(@Param('queue') queue: string) {
//     const q = this.getQueue(queue);
//     await q.clean(0, 100, 'completed');
//     return { success: true, message: `Completed jobs cleaned from ${queue}` };
//   }

//   private getQueue(name: string): Queue {
//     switch (name) {
//       case QUEUES.EMAIL: return this.emailQueue;
//       case QUEUES.CLEANUP: return this.cleanupQueue;
//       case QUEUES.PRODUCT_COUNTS: return this.productCountsQueue;
//       default: throw new Error(`Unknown queue: ${name}`);
//     }
//   }
// }