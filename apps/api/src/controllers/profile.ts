import { Request, Response } from 'express';
import { HTTP_STATUS_CODES } from '@athaar/types';


async function createProfile(req: Request, res: Response) {
  try {
    const profileData = req.body;
    // Assume profileService is defined and has a create method
    const newProfile = await profileService.create(profileData);
    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
}
