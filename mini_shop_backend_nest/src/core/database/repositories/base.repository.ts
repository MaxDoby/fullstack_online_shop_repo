type RepositoryMethod = (...args: any[]) => any;

type RepositoryDelegate = {
  findMany: RepositoryMethod;
  findUnique: RepositoryMethod;
  create: RepositoryMethod;
  update: RepositoryMethod;
  delete: RepositoryMethod;
};

export abstract class BaseRepository<TDelegate extends RepositoryDelegate> {
  protected constructor(protected readonly delegate: TDelegate) {}

  public findMany(
    args?: Parameters<TDelegate['findMany']>[0],
  ): ReturnType<TDelegate['findMany']> {
    return this.delegate.findMany(args) as ReturnType<TDelegate['findMany']>;
  }

  public findUnique(
    args: Parameters<TDelegate['findUnique']>[0],
  ): ReturnType<TDelegate['findUnique']> {
    return this.delegate.findUnique(args) as ReturnType<
      TDelegate['findUnique']
    >;
  }

  public create(
    args?: Parameters<TDelegate['create']>[0],
  ): ReturnType<TDelegate['create']> {
    return this.delegate.create(args) as ReturnType<TDelegate['create']>;
  }

  public delete(
    args?: Parameters<TDelegate['delete']>[0],
  ): ReturnType<TDelegate['delete']> {
    return this.delegate.delete(args) as ReturnType<TDelegate['delete']>;
  }
}
