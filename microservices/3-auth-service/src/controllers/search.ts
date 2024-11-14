import { gigById, gigsSearch } from '@auth/services/search.service';
import { IPaginateProps, ISearchResult } from '@thejuggernaut01/jobberapp-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sortBy } from 'lodash';

export const gigs = async (req: Request, res: Response): Promise<void> => {
  const { size, from, type } = req.params;
  let resultHits: unknown[] = [];

  const paginate: IPaginateProps = {
    from,
    size: parseInt(size),
    type
  };

  const gigs: ISearchResult = await gigsSearch(
    req.query.query as string,
    paginate,
    req.query.deliveryTime as string,
    parseInt(req.query.min as string),
    parseInt(req.query.max as string)
  );

  for (const item of gigs.hits) {
    resultHits.push(item._source);
  }

  if (type === 'backward') {
    resultHits = sortBy(resultHits, ['sortId']);
  }

  res.status(StatusCodes.OK).json({ message: 'Search gigs results', total: gigs.total, gigs, resultHits });
};

export const singleGigById = async (req: Request, res: Response): Promise<void> => {
  const gig = await gigById('gigs', req.params.gigId as string);

  res.status(StatusCodes.OK).json({ message: 'Single gig results', gig });
};
