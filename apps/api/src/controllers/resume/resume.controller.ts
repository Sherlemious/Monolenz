import { Request, Response } from 'express';
import { HTTP_STATUS_CODES } from '@monolenz/types/api';
import { asyncHandler } from '../../utils/async-handler';
import { ServiceContext } from '../../services/base.service';
import { ResumeService } from '../../services/domain/resume.service';
import { ResumeRepository } from '../../repositories/profile/resume.repository';
import { ProfileBlockService } from '../../services/domain/profile-block.service';
import { BlocksRepository } from '../../repositories/blocks/blocks.repository';
import { VersionsRepository } from '../../repositories/profile/versions.repository';
import { VersionBlocksRepository } from '../../repositories/profile/version-blocks.repository';
import { prisma } from '../../config/prisma';

function contextFrom(req: Request): ServiceContext {
  return {
    userId: req.userId,
    userRole: req.userRole,
    requestId: req.requestId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
}

class ResumeController {
  private resumeService: ResumeService;

  constructor() {
    const versionsRepo = new VersionsRepository(prisma);
    const versionBlocksRepo = new VersionBlocksRepository(prisma);
    const blockService = new ProfileBlockService(new BlocksRepository(prisma), versionsRepo, versionBlocksRepo, prisma);
    this.resumeService = new ResumeService(
      new ResumeRepository(prisma),
      blockService,
      versionsRepo,
      versionBlocksRepo,
      prisma
    );
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    const resumes = await this.resumeService.listMine(contextFrom(req));
    return res.success(resumes, 'Resumes retrieved successfully');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const resume = await this.resumeService.createMine(req.validatedBody, contextFrom(req));
    return res.success(resume, 'Resume created successfully');
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const resume = await this.resumeService.getMine(req.validatedParams.id, contextFrom(req));
    return res.success(resume, 'Resume retrieved successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const resume = await this.resumeService.updateMine(req.validatedParams.id, req.validatedBody, contextFrom(req));
    return res.success(resume, 'Resume updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.resumeService.deleteMine(req.validatedParams.id, contextFrom(req));
    return res.success(null, 'Resume deleted successfully');
  });

  downloadPdf = asyncHandler(async (req: Request, res: Response) => {
    const { buffer, filename } = await this.resumeService.renderPdf(req.validatedParams.id, contextFrom(req));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(HTTP_STATUS_CODES.OK).send(buffer);
  });

  tailor = asyncHandler(async (req: Request, res: Response) => {
    const proposal = await this.resumeService.proposeTailor(
      req.validatedParams.id,
      req.validatedBody,
      contextFrom(req)
    );
    return res.success(proposal, 'Tailor proposal generated');
  });

  applyTailor = asyncHandler(async (req: Request, res: Response) => {
    const resume = await this.resumeService.applyTailor(req.validatedParams.id, req.validatedBody, contextFrom(req));
    return res.success(resume, 'Tailored resume created');
  });
}

export const resumeController = new ResumeController();
