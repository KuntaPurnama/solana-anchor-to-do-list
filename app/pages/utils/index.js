export function filterWithAuthor(publicKey){
    const filter = {
        memcmp: {
            offset: 8,
            bytes: publicKey.toString()
        },
      };
   
    return filter
}