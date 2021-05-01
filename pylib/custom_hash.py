import sys # obtains system process
import hashlib # string hashing module

args = sys.argv
del args[0]

hashed_args = []

for arg in args:
    arg_as_bytes = str.encode(arg);
    hash_obj = hashlib.sha256(arg_as_bytes)
    hash_obj_digested = hash_obj.hexdigest()
    hashed_args.append(hash_obj_digested)

stringified_hashed_args = ",".join(hashed_args)
print(stringified_hashed_args)
